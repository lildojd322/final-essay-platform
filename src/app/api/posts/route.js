import { fetchPostsFromDB, getPostsFromDBByKeyword, fetchPostsFromDBById } from "@/lib/db"
import { NextResponse } from "next/server"
import { idParamSchema, offsetLimitSchema, keywordSchema } from '../../../lib/zod'


export async function GET(request) {
    const { searchParams } = new URL(request.url)

    const idValidation = idParamSchema.safeParse({
        id: searchParams.get("userId") || ""
    })

    const limitOffsetValidation = offsetLimitSchema.safeParse({
        limit: parseInt(searchParams.get("limit")) || 20,
        offset: parseInt(searchParams.get("offset")) || 0
    })


    if (!limitOffsetValidation.success) {
        return NextResponse.json({ error: "Некорректная пагинация" }, { status: 400 })
    }

    const { limit, offset } = limitOffsetValidation.data



    let userId = null
    if (idValidation.success) {
        userId = idValidation.data.id
    }



    const keywordValidation = keywordSchema.safeParse({
        keyword: searchParams.get("keyword") || ""
    })

    if (!keywordValidation.success) {
        return NextResponse.json({
            error: "Неверный формат ключевого слова"
        }, { status: 400 })
    }

    const { keyword } = keywordValidation.data

    let posts = []
    try {
        if (userId) {
            posts = await fetchPostsFromDBById(userId, limit, offset)
        }
        else if (keyword) {
            posts = await getPostsFromDBByKeyword(keyword, limit, offset)
        } else {
            posts = await fetchPostsFromDB(limit, offset)
        }
        return NextResponse.json(posts)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "ошибка базы данных" }, { status: 500 })
    }
}