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
            setError(result.error || 'Registration failed')
        }
    }

    return (
        <>
            {isSuccess ? <h2>We have sent an email to your email address. Please check and confirm your email!</h2> : (<>
                <h1 className={styles.h1}>Register account</h1>
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
                        Register
                    </button>
                </form>

            </>)}

        </>
    )
}

export default RegisterForm