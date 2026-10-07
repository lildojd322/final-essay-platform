import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { redis } from "@/lib/redis"
import { updateUserVerificationToken } from '@/lib/db'
import crypto from 'crypto'
export async function POST(request) {
    try {
        const body = await request.json()
        const { email, code, flow = 'activation' } = body


        if (!email || !code) {
            return NextResponse.json({ success: false, error: 'Missing data.' }, { status: 400 })
        }
        const cleanEmail = email.trim().toLowerCase()

        const rawSavedCode = await redis.get(`auth_code:${cleanEmail}`)

        const savedCode = rawSavedCode ? String(rawSavedCode) : null
        if (!savedCode || savedCode !== code.trim()) {
            return NextResponse.json({ success: false, error: 'Invalid or expired code.' }, { status: 400 })
        }

        await redis.del(`auth_code:${cleanEmail}`)

        if (flow === 'reset') {
            const resetToken = crypto.randomBytes(32).toString('hex')
            await redis.set(`reset_token:${cleanEmail}`, resetToken, { ex: 300 })
            return NextResponse.json({ success: true, resetToken })

        } else {

            await updateUserVerificationToken(cleanEmail)

            const bypassToken = crypto.randomBytes(32).toString('hex')
            await redis.set(`bypass_token:${cleanEmail}`, bypassToken, { ex: 60 })

            return NextResponse.json({ success: true, bypassToken })
        }


    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }

}