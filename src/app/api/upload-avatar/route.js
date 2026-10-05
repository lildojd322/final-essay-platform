import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { updateUserAvatarByEmail } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authConfig } from '../../../lib/auth'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(request) {
    try {
        const session = await getServerSession(authConfig)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('avatar')

        if (!file) {
            return NextResponse.json({ error: 'No file' }, { status: 400 })
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'JPG, PNG or WebP only' }, { status: 400 })
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

        const safeUserId = session.user.email.replace(/[^a-zA-Z0-9]/g, '_')

    const result = await cloudinary.uploader.upload(base64, {
            folder: 'avatars',
            public_id: `user_${safeUserId}`,
            overwrite: true,              
            invalidate: true,              
            transformation: [
                { width: 300, height: 300, crop: 'fill' },
                { format: 'webp', quality: 'auto' }
            ]
        })
        const url = result.secure_url

        await updateUserAvatarByEmail(session.user.email, url)

        return NextResponse.json({ url })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
