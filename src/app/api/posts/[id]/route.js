import { deletePostById, fetchPostFromDBById } from "@/lib/db"
import { NextResponse } from "next/server"
import { idParamSchema } from '../../../../lib/zod'
import { authConfig } from "@/lib/auth"
import { getServerSession } from "next-auth/next"


export async function DELETE(request, { params }) {


    try {
        const session = await getServerSession(authConfig)

        if (!session.user) {
            return NextResponse.json({ error: "Пользователь не авторизован" }, { status: 401 })
        }


        const resolvedParams = await params
        const validation = idParamSchema.safeParse({
            id: resolvedParams.id
        })

        if (!validation.success) {

            console.log("backend Zod error:", validation.error.format())
            return NextResponse.json({ error: "Неверный формат идентификатора" }, { status: 400 })
        }
        const id = Number(validation.data.id)




        let result

        let post = await fetchPostFromDBById(id)


        if (String(session.user.id) !== String(post.userId)) {
            return NextResponse.json({ error: "не тот пользователь" }, { status: 403 })
        }


        result = await deletePostById(id)

        if (!result || result.affectedRows === 0) {
            return NextResponse.json({ error: "post not found" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: "Пост удалён",
            affectedRows: result.affectedRows
        })





    } catch (error) {
        return NextResponse.json({ error: "db error" }, { status: 500 })
    }
}   