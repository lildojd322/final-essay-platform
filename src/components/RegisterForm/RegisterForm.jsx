"use client"
import styles from './RegisterForm.module.scss'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { registerSchema } from "@/lib/zod"

const RegisterForm = () => {
    const router = useRouter()
    const [error, setError] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        const formData = new FormData(event.currentTarget)

        const data = Object.fromEntries(formData.entries())

        const validation = registerSchema.safeParse(data)
        const targetForm = event.target
        if (!validation.success) {
            const firstError = validation.error.issues[0].message
            setError(firstError)
            return
        }



        const response = await fetch('/api/users/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validation.data)
        })

        if (response.ok) {
            setError('')
            targetForm.reset()
            const data = await response.json()
            sessionStorage.setItem('pending_verification_email', data.email)
            router.push(`/emailConfirm`)
        } else {
            const result = await response.json()
            setError(result.error || 'ошибка регистрации')
        }
    }

    return (
        <>
            {isSuccess ? <h2>Мы отправили письмо на вашу электронную почту, проверьте ее.</h2> : (<>
                <h1 className={styles.h1}>Регистрация</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}
                    <input
                        type="text"
                        name="name"
                        placeholder="name"
                        required
                        className={styles.input}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                        className={styles.input}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        autoComplete="new-password"
                        required
                        className={styles.input}
                    />
                    <input
                        type="password"
                        name="repeatPassword"
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        required
                        className={styles.input}
                    />
                    <button type="submit" className={styles.submitButton}>
                        зарегистрироваться
                    </button>
                </form>

            </>)}

        </>
    )
}

export default RegisterForm