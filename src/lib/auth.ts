import type { AuthOptions, User } from "next-auth";
import GoogleProvider from 'next-auth/providers/google'
import Credentials from "next-auth/providers/credentials";
import { getUserFromDBByEmail, createGoogleUserInDB } from '@/lib/db'
import { compare } from 'bcryptjs'
import { loginSchema } from '@/lib/zod'
import { headers } from 'next/headers'
import { checkLimit } from './ratelimit'
import {redis} from './redis'
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


                const currentUser = await getUserFromDBByEmail(email)

                if (!currentUser) {
                    throw new Error("UserNotFound")

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

                    const dbUser = await getUserFromDBByEmail(user.email);
                    if (dbUser) {
                        token.sub = String(dbUser.id);
                    }
                } else {

                    token.sub = user.id
                }
            }
            return token
        }
    }
}

