'use client'
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import styles from './SignInForm.module.scss'
import { loginSchema } from '@/lib/zod'

const SignInForm = () => {
    const router = useRouter()
    const [error, setError] = useState('')
    const [isPending, setIsPending] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setIsPending(true)

        const formData = new FormData(event.currentTarget)
        const data = Object.fromEntries(formData.entries())
        const validation = loginSchema.safeParse(data)

        if (!validation.success) {
            setError(validation.error.issues[0].message)
            setIsPending(false)
            return
        }

        try {

            const response = await fetch('/api/users/reaffirm/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validation.data)
            })


            const resData = await response.json()

            if (!response.ok) {
                setError(resData.error || 'Something went wrong')
                return
            }
            if (resData.success) {
                sessionStorage.setItem('pending_verification_email', validation.data.email)
                router.push(`/emailConfirm`)
                router.refresh()
            }
        } catch (err) {
            setError('Failed to connect to server')
        } finally {
            setIsPending(false)
        }

    }


    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
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
                required
                className={styles.input}
            />
            <button type="submit" disabled={!!isPending} className={styles.submitButton}>
                Sign in
            </button>
        </form>
    )
}

export default SignInForm