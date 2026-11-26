import { z } from "zod"

export const registerSchema = z.object({
    name: z.string().min(2, "Имя должно содержать минимум 2 символа").max(23, "Имя не должно превышать 23 символа"),
    email: z.string().email("Некорректный формат электронной почты"),
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов").max(25, "Пароль не должен превышать 25 символов"),
})


export const loginSchema = z.object({
    email: z.string().email("Некорректный формат электронной почты"),
    password: z.string().min(6, "Пароль слишком короткий (минимум 6 символов)"),
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
    post_id: z.string().min(1, "ID поста обязателен"),
    user_role: z.string(),

    user_id: z.string().min(1, "ID пользователя обязателен"),
    parent_comment_id: z.string().nullable().optional().or(z.literal('')),
    comment_text: z.string()
        .trim()
        .min(1, "Комментарий не может быть пустым")
        .max(5000, "Комментарий слишком длинный (максимум 5000 символов)")
})

export const idParamSchema = z.object({
    id: z.coerce.number().int("ID должен быть целым числом").positive("ID должен быть положительным числом")
})

export const offsetLimitSchema = z.object({
    offset: z.coerce.number().int("Смещение (offset) должно быть целым числом").min(0, "Смещение (offset) должно быть больше или равно 0"),
    limit: z.coerce.number().int("Лимит (limit) должен быть целым числом").min(1, "Лимит (limit) должен быть не менее 1").max(100, "Максимальный лимит (limit) — 100"),
})


export const keywordSchema = z.object({
    keyword: z.string().max(100, "Поисковый запрос не должен превышать 100 символов").optional().default("")
})


export const emailSchema = z.object({
    email: z.string().email("Некорректный формат электронной почты").min(2, "Электронная почта должна содержать минимум 2 символа")
        .max(60, "Электронная почта не должна превышать 60 символов"),
})

const passwordFields = z.object({
    password: z
        .string()
        .min(6, "Пароль должен содержать минимум 6 символов")
        .max(25, "Пароль не должен превышать 25 символов"),
    repeatPassword: z
        .string()
        .min(1, "Пожалуйста, повторите пароль")
})


export const newPasswordSchema = passwordFields.refine(
    (data) => data.password === data.repeatPassword,
    {
        message: "Пароли не совпадают",
        path: ["repeatPassword"],
    }
)


export const backendPasswordResetSchema = passwordFields
    .extend({
        email: z.string().email("Некорректный формат электронной почты"),
        token: z.string().min(1, "Токен обязателен")
    })
    .refine(
        (data) => data.password === data.repeatPassword,
        {
            message: "Пароли не совпадают",
            path: ["repeatPassword"],
        }
    )
