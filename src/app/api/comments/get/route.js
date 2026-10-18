import { getCommentsFromDBByPostId, getCountCommentsFromDBByPostId } from '../../../../lib/db'
import { NextResponse } from 'next/server'
import { idParamSchema } from '../../../../lib/zod'
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)


        const validation = idParamSchema.safeParse({
            id: searchParams.get('id')
        })


        if (!validation.success) {

            console.log("backend Zod error:", validation.error.format())
            return NextResponse.json({ error: "Неверный формат данных" }, { status: 400 })
        }
        const { id } = validation.data

        const commentsPromise = getCommentsFromDBByPostId(id)
        const countCommentsPromise = getCountCommentsFromDBByPostId(id)

        const [comments, countComments] = await Promise.all([commentsPromise, countCommentsPromise])


        return NextResponse.json({
            message: "комментарии успешно получены",
            success: true,
            data: {
                comments: comments,
                count: countComments
            }
        }, { status: 200 })
    } catch (error) {

        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
    }


}

