import { NextResponse } from "next/server"
import { deleteExpiredUsers, deleteExpiredResetTokens } from '../../../../lib/db'

export async function GET(request) {
  
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "неавторизован" }, { status: 401 })
    }

    try {
        const deleteExpiredUsersPromise = deleteExpiredUsers()
        const deleteExpiredResetTokensPromise = deleteExpiredResetTokens()
     
        await Promise.all([deleteExpiredUsersPromise, deleteExpiredResetTokensPromise])

        return NextResponse.json({ success: true, message: 'очистка выполнена успешно' }, { status: 200 })

    } catch (error) {
        console.error("CRON CLEANUP ERROR:", error) 

        return NextResponse.json({
            error: "Внутренняя ошибка сервера"
        }, { status: 500 })
    }
}
