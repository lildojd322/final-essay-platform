    import { forwardCommentToDB } from '../../../../lib/db'
    import { NextResponse } from 'next/server'
    import { commentSchema } from '../../../../lib/zod'

    import { authConfig } from "@/lib/auth"
    import { getServerSession } from "next-auth/next"


    export async function POST(request) {
        try {
            const body = await request.json()


            const validation = commentSchema.safeParse(body)

            if (!validation.success) {

                console.log("backend Zod error:", validation.error.format())
                return NextResponse.json({ error: "Неверный формат данных" }, { status: 400 })
            }

            const { post_id: postId, comment_text: commentText, parent_comment_id: parentId = null, user_role: userRole  } = validation.data


            const session = await getServerSession(authConfig)

            if (!session) {
                return NextResponse.json({ error: "Пользователь не авторизован" }, { status: 401 })
            }

            const userId = session.user.id



            
            await forwardCommentToDB(commentText, postId, userId, parentId, userRole)


            return NextResponse.json({
                message: "Комментарий успешно создан",
                success: true,

            }, { status: 200 })
        } catch (error) {
            console.log(error)
            return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
        }


    }

