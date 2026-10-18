import { updateUserPassword } from "@/lib/db"
import { NextResponse } from "next/server"
import { backendPasswordResetSchema } from "@/lib/zod"
import { z } from "zod"
import { redis } from "@/lib/redis"

export async function POST(request) {
    try {
        const body = await request.json()
        const parsedData = backendPasswordResetSchema.parse(body)
        const { password, email, token } = parsedData

        const cleanEmail = email.trim().toLowerCase()

        const savedToken = await redis.get(`reset_token:${cleanEmail}`)


        if (!savedToken || savedToken !== token) {
            return NextResponse.json(
                { success: false, error: "Срок действия ссылки или токена истек. Пожалуйста, попробуйте еще раз." },
                { status: 400 }
            )
        }



        await updateUserPassword(password, cleanEmail)

        await redis.del(`reset_token:${cleanEmail}`)


        return NextResponse.json({
            success: true,
            message: "Пароль успешно обновлен"
        })

    } catch (error) {
        console.log('ERROR', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }


        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
    }


}