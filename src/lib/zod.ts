import { z } from "zod"

export const registerSchema = z.object({
    name: z.string().min(2, "The name must be at least 2 characters long").max(23, "the name must not exceed 23 characters"),
    email: z.string().email("Incorrect email format"),
    password: z.string().min(6, "Password must be at least 6 characters long").max(25, "the password must not exceed 25 characters"),
})


export const loginSchema = z.object({
    email: z.string().email("Invalid mail format"),
    password: z.string().min(6, "Password is too short"),

})


const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']


export const postSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2, 'Название должно содержать минимум 2 символа')
        .max(150, 'Название слишком длинное (максимум 150 символов)'),

    description: z
        .string()
        .trim()
        .min(3, 'Описание должно содержать минимум 3 символа')
        .max(5000, 'Описание слишком длинное (максимум 5000 символов)'),

    images: z
        .array(z.instanceof(File))
        .max(5, 'Можно прикрепить максимум 5 фотографий')
        .refine(
            (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
            'Размер каждой фотографии не должен превышать 5 МБ'
        )
        .refine(
            (files) => files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
            'Поддерживаются только форматы JPG, PNG и WebP'
        )
        .optional()
        .default([]),
})

export const commentSchema = z.object({

    post_id: z.string().min(1, "Post ID is required"),
    user_role: z.string(),

    user_id: z.string().min(1, "User ID is required"),
    parent_comment_id: z.string().nullable().optional().or(z.literal('')),
    comment_text: z.string()
        .trim()
        .min(1, "Comment cannot be empty")
        .max(500, "Comment is too long (maximum 500 characters)")
})

export const idParamSchema = z.object({
    id: z.coerce.number().int().positive("ID must be a positive integer")
})

export const offsetLimitSchema = z.object({
    offset: z.coerce.number().int().min(0, "offset must be 0 or greater"),
    limit: z.coerce.number().int().min(1, "limit must be at least 1").max(100, "limit max 100"),
})


export const keywordSchema = z.object({
    keyword: z.string().max(100).optional().default("")
})


export const emailSchema = z.object({
    email: z.string().email("Incorrect email format").min(2, "The email must be at least 2 characters long")
        .max(60, "the email must not exceed 60 characters"),
})

const passwordFields = z.object({
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .max(25, "The password must not exceed 25 characters"),
    repeatPassword: z
        .string()
        .min(1, "Please repeat your password")
})


export const newPasswordSchema = passwordFields.refine(
    (data) => data.password === data.repeatPassword,
    {
        message: "Passwords do not match",
        path: ["repeatPassword"],
    }
)


export const backendPasswordResetSchema = passwordFields
    .extend({
        email: z.string().email("Incorrect email format"),
        token: z.string().min(1, "Token is required")
    })
    .refine(
        (data) => data.password === data.repeatPassword,
        {
            message: "Passwords do not match",
            path: ["repeatPassword"],
        }
    )
