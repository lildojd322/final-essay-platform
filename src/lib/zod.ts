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


export const postSchema = z.object({
    title: z.string().min(2, "The title must be at least 2 characters long").max(50, 'title is too long'),
    description: z.string().min(3, "The description must be at least 3 characters long").max(300, 'description is too long ')
})

export const commentSchema = z.object({

    post_id: z.string().min(1, "Post ID is required"),


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

export const newPasswordSchema = z.object({
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .max(25, "The password must not exceed 25 characters"),
    repeatPassword: z
        .string()
        .min(1, "Please repeat your password")
})
    .refine((data) => data.password === data.repeatPassword, {
        message: "Passwords do not match",
        path: ["repeatPassword"],
    }) 