import { forwardUserToDB } from "@/lib/db"
import { NextResponse } from "next/server"
import { registerSchema } from "@/lib/zod"
import { z } from "zod"

import { sendCodeMailToUserEmail } from "../../../../hooks/sendCodeMailToUserEmail"

export async function POST(request) {
    try {
        const body = await request.json()
        const { email, password, name } = registerSchema.parse(body)




        await sendCodeMailToUserEmail(email, name)


        await forwardUserToDB(email, password, name)

        return NextResponse.json({
            success: true,
            step: 'VERIFICATION_REQUIRED',
            email: email
        })


    } catch (error) {

        console.error("API ERROR:", error)


        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }

        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 })
        }

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }


}