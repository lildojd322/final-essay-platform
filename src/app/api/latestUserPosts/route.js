import { fetchLatestPostsFromDBById, fetchCountPostFromDBByUserId } from '../../../lib/db'
import { NextResponse } from "next/server"
import { idParamSchema } from '../../../lib/zod'

export const GET = async (request) => {
    try {


        const { searchParams } = new URL(request.url)

        const validation = idParamSchema.safeParse({
            id: searchParams.get('id')
        })

        if (!validation.success) {

            console.log("backend Zod error:", validation.error.format())
            return NextResponse.json({ error: "Неверный формат данных" }, { status: 400 })
        }
        const userId = validation.data.id

        const postsPromise = fetchLatestPostsFromDBById(userId)
        const countPostsPromise = fetchCountPostFromDBByUserId(userId)
        const [posts, countPosts] = await Promise.all([postsPromise, countPostsPromise])

        const data = [posts, countPosts]

        return NextResponse.json({
            message: "публикация успешно получена",
            success: true,
            data: {
                posts: posts,
                count: countPosts
            }
        }, { status: 200 })
    } catch (error) {

        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
    }
}
