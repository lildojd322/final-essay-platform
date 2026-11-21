import { forwardPostToDB } from "@/lib/db"
import { NextResponse } from "next/server"
import { postSchema } from "@/lib/zod"
import { z } from "zod"
import { authConfig } from "@/lib/auth"
import { getServerSession } from "next-auth/next"
import { uploadToCloudinary } from "../../../hooks/uploadToCloudinary"


export const POST = async (request) => {
    const session = await getServerSession(authConfig)
    if (!session) {
        return NextResponse.json({ error: "неавторизован" }, { status: 401 });
    }
    try {

        const userName = session.user.name
        const userEmail = session.user.email
        const userId = session.user.id

        const formData = await request.formData()

        const rawImages = formData.getAll("images").filter((file) => file && file.size > 0)

        const rawData = {
            title: formData.get("title"),
            description: formData.get("description"),
            images: rawImages,
        }

        const { description, title, images } = postSchema.parse(rawData)


        const imageUrls = images.length > 0
            ? await Promise.all(
                images.map((file) => uploadToCloudinary(file, { folder: "tasks" }))
            )
            : []



        const result = await forwardPostToDB(
            title,
            description,
            userEmail,
            userName,
            userId,
            imageUrls
        )

        return NextResponse.json({
            message: "публикация успешно создана",
            success: true,
            id: result.id,
            images: imageUrls,
        }, { status: 201 })

    } catch (error) {
        console.error("API ERROR:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }

        return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
    }
}

