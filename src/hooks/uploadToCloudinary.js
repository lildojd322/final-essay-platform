import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * @param {File} file
 * @param {Object} options 
 */
export async function uploadToCloudinary(file, { folder, publicId = null, isAvatar = false }) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`


    const transformation = isAvatar
        ? [
            { width: 300, height: 300, crop: 'fill' },
            { format: 'webp', quality: 'auto' },
        ]
        : [
            { width: 1400, crop: 'limit' },
            { format: 'webp', quality: 'auto' },
        ]

    const uploadOptions = {
        folder,
        transformation,
    }


    if (publicId) {
        uploadOptions.public_id = publicId
        uploadOptions.overwrite = true
        uploadOptions.invalidate = true
    }

    const result = await cloudinary.uploader.upload(base64, uploadOptions)
    return result.secure_url
}
function getPublicIdFromUrl(url) {
    if (!url || typeof url !== 'string') return null


    const parts = url.split('/upload/')
    if (parts.length < 2) return null


    return parts[1].replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '')
}


export async function deleteFromCloudinary(urls) {
    const urlList = Array.isArray(urls) ? urls : [urls]

    const deletePromises = urlList.map((url) => {
        const publicId = getPublicIdFromUrl(url)
        if (!publicId) return Promise.resolve(null)

        return cloudinary.uploader.destroy(publicId)
    })


    return Promise.allSettled(deletePromises)
}