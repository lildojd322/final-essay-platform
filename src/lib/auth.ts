import type { AuthOptions, User } from "next-auth";
import GoogleProvider from 'next-auth/providers/google'
import Credentials from "next-auth/providers/credentials";
import { getUserFromDBByEmail, createGoogleUserInDB, getTeacherEmailsFromDB } from '@/lib/db'
import { compare } from 'bcryptjs'
import { loginSchema } from '@/lib/zod'
import { headers } from 'next/headers'
import { checkLimit } from './ratelimit'
import { redis } from './redis'
export const authConfig: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            credentials: {
                email: { label: 'email', type: 'email', required: true },
                password: { label: 'password', type: 'password', required: true },

            },
            async authorize(credentials) {
                if (!credentials) {
                    return null
                }
                const parsedCredentials = loginSchema.safeParse(credentials)
                if (!parsedCredentials.success) {
                    return null
                }
                const { email, password } = parsedCredentials.data
                const headersList = await headers()
                const ip = headersList.get('x-forwarded-for') || 'unknown'
                const key = `${ip}:${credentials.email}`

                const limit = await checkLimit(key)

                if (!limit.allowed) {
                    throw new Error('TooManyAttempts')
                }

                const [currentUser, teacherEmails] = await Promise.all([
                    getUserFromDBByEmail(email),
                    getTeacherEmailsFromDB()
                ])

                if (!currentUser) {
                    throw new Error("UserNotFound")
                }

                const isTeacher = teacherEmails.some((t: any) =>
                    (typeof t === 'string' ? t : t.email).toLowerCase() === cleanEmail
                )

                currentUser.role = isTeacher ? 'teacher' : 'student'

                const cleanEmail = email ? email.trim().toLowerCase() : ""



                if (password && password.length === 64) {

                    const savedBypassToken = await redis.get(`bypass_token:${cleanEmail}`)

                    if (savedBypassToken && savedBypassToken === password) {
                        await redis.del(`bypass_token:${cleanEmail}`)
                        const { password: _, ...userWithoutPass } = currentUser
                        return userWithoutPass
                    }
                }
                if (!currentUser.emailVerified) {
                    throw new Error("EmailNotVerified")
                }
                if (currentUser && currentUser.password) {
                    const isPasswordCorrect = await compare(
                        password,
                        currentUser.password
                    )
                    if (isPasswordCorrect) {
                        await redis.del(`rate_limit:${key}`)
                        const { password, ...userWithoutPass } = currentUser
                        return userWithoutPass as User
                    }
                }
                return null
            }
        })

    ],
    pages: {
        signIn: '/signin',
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {

                    const currentUser = await getUserFromDBByEmail(user.email!)

                    if (!currentUser) {
                        await createGoogleUserInDB({
                            name: user.name,
                            email: user.email,
                            image: user.image
                        })
                    }
                } catch (error) {
                    console.error("Error saving google user:", error)
                    return true
                }
            }
            return true
        },

        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub
                session.user.provider = token.provider
                session.user.image = token.picture
                session.user.role = token.role as string
            }
            return session
        },
        async jwt({ token, user, account, session, trigger }) {

            if (trigger === 'update' && session?.image) {
                token.picture = session.image
                return token
            }
            if (user) {
                if (account) {
                    token.picture = user.image
                    token.provider = account.provider

                }
                if (account?.provider === "google") {

                    const [dbUser, teacherEmails] = await Promise.all([
                        getUserFromDBByEmail(user.email!),
                        getTeacherEmailsFromDB()
                    ])
                    if (dbUser) {
                        token.sub = String(dbUser.id)



                        const isTeacher = teacherEmails.some((t: any) =>
                            (typeof t === 'string' ? t : t.email).toLowerCase() === user.email?.toLowerCase()
                        )
                        token.role = isTeacher ? 'teacher' : 'student'

                    }
                } else {
                    token.sub = user.id
                    token.role = (user as any).role || 'student'
                }
            }
            return token
        }
    }
}

