import { getUserFromDBByEmail } from "@/lib/db"
import { NextResponse } from "next/server"
import { loginSchema } from "@/lib/zod"
import { sendCodeMailToUserEmail } from "../../../../hooks/sendCodeMailToUserEmail"
import { compare } from 'bcrypt'
import { z } from "zod"

export async function POST(request) {
    try {
        const body = await request.json()
        const { email, password } = loginSchema.parse(body)


        const user = await getUserFromDBByEmail(email)
        if (!user) {
            return NextResponse.json({ error: "Incorrect email or password" }, { status: 400 })
        }
        if (!user?.password) {
            return NextResponse.json({
                error: "Этот аккаунт зарегистрирован через социальные сети. Войдите с помощью Google."
            }, { status: 400 })
        }



        const { password: hashedPassword, name } = user

        const isPasswordCorrect = await compare(
            password,
            hashedPassword
        )

        if (!isPasswordCorrect) {
            return NextResponse.json({ error: "Incorrect email or password" }, { status: 400 })
        }

        await sendCodeMailToUserEmail(email, name)

        return NextResponse.json({
            success: true,
            step: 'VERIFICATION_REQUIRED',
            email: email
        })


    } catch (error) {

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }


        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }


}