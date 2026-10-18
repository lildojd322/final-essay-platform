import { deleteCommentById, fetchCommentFromDBById } from '../../../../lib/db'
import { NextResponse } from 'next/server'
import { idParamSchema } from '../../../../lib/zod'
import { authConfig } from "@/lib/auth"
import { getServerSession } from "next-auth/next"


export async function DELETE(request) {

    const session = await getServerSession(authConfig)
    try {



        if (!session.user) {
            return NextResponse.json({ error: "Пользователь не авторизован" }, { status: 401 })
        }



        const { searchParams } = new URL(request.url)
        const validation = idParamSchema.safeParse({
            id: searchParams.get('id')
        })


        if (!validation.success) {

            console.log("backend Zod error:", validation.error.format())
            return NextResponse.json({ error: "Неверный формат данных" }, { status: 400 })
        }
        const { id } = validation.data

        const currentComment = await fetchCommentFromDBById(id)

        if (String(currentComment.user_id) !== String(session.user.id)) {
            return NextResponse.json({ error: "не тот пользователь" }, { status: 403 })
        }

        await deleteCommentById(id)
        return NextResponse.json({
            message: "комментарии успешно удалены",
            success: true,

        }, { status: 200 })
    } catch (error) {

        return NextResponse.json({ error: "Внутренняя ошибка сервера", details: error.message }, { status: 500 })
    }


}