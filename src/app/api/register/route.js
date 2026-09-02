import { forwardUserToDB } from "@/lib/db"
import { NextResponse } from "next/server"
import { registerSchema } from "@/lib/zod"
import { z } from "zod"
import { createTransport } from "nodemailer"



export async function POST(request) {
    try {

        const body = await request.json()
        const { email, password, name } = registerSchema.parse(body)
        const result = await forwardUserToDB(email, password, name)

        const confirmationLink = `${process.env.NEXTAUTH_URL}/confirm-email?token=${result.token}`


        const transport = createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT),
            secure: true,
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        })


        await transport.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'mail confirmation',
            html: `
            <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Welcome, ${name}!</h2>
                    <p>To activate your account, click the button below:</p>
                    <a href="${confirmationLink}" style="background: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                     Activate account
                    </a>
                    <p style="margin-top: 15px; color: #666; font-size: 12px;">The link will expire in 1 hour.</p>
                </div>
         `
        })


        return NextResponse.json({
            message: "User created successfully",
            success: true
        }, { status: 201 })




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