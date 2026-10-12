import { getUserFromDBByEmail } from "@/lib/db"
import { NextResponse } from "next/server"
import { emailSchema } from "@/lib/zod"
import { sendCodeMailToUserEmail } from "../../../../hooks/sendCodeMailToUserEmail"
import { z } from "zod"

export async function POST(request) {
    try {
        const body = await request.json()
        const { email } = emailSchema.parse(body)


        const user = await getUserFromDBByEmail(email)


        if (!user) {
            return NextResponse.json({ error: "пользователя с такой почтой нет" }, { status: 400 })
        }
        if (!user?.password) {
            return NextResponse.json({ error: "этот пользователь зашел с помощью соцсетей" }, { status: 400 })
        }

        if (!user.emailVerified) {
            return NextResponse.json({ error: "пользователь не подтвердил почту" }, { status: 400 })
        }




        const { name } = user

        await sendCodeMailToUserEmail(email, name)

        return NextResponse.json({
            success: true,
            email: email
        })


    } catch (error) {

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }


        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }


}