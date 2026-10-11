'use client'
import styles from './reset.module.scss'
import { useState } from "react"
import { emailSchema } from '@/lib/zod'
import { useRouter } from "next/navigation"

const resetPassword = () => {
    const router = useRouter()
    const [error, setError] = useState('')
    const [isPending, setIsPending] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setIsPending(true)

        const formData = new FormData(event.currentTarget)
        const data = Object.fromEntries(formData.entries())
        const validation = emailSchema.safeParse(data)

        if (!validation.success) {
            setError(validation.error.issues[0].message)
            setIsPending(false)
            return
        }
        try {
            const response = await fetch('/api/users/resetPassword/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: validation.data.email,
                })
            })

            const resData = await response.json()

            if (!response.ok) {
                setError(resData.error || 'Something went wrong')
                setIsPending(false)
                return
            }
            if (resData.success) {
                sessionStorage.setItem('pending_verification_email', validation.data.email)
                router.push(`/reset-password/verify`)
                router.refresh()
            }
        } catch (err) {
            setError('Failed to connect to server')
            setIsPending(false)
        }

    }

    return (
        <form onSubmit={handleSubmit} >
            <h2 className={styles.h2}>
                Enter your email
            </h2>
            <div className={styles.inputContainer}>
                <input placeholder="Email"
                    required className={styles.input} type="email" name="email" />

                <button type='submit' className={styles.submitButton}>confirm</button>
                {error && <p className={styles.error}>{error}</p>}
            </div>

        </form>
    )
}

export default resetPassword