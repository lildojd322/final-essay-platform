'use client'

import { useEffect, useState } from "react"
import styles from '../reset.module.scss'
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { newPasswordSchema } from '@/lib/zod'
import { signIn } from "next-auth/react"


const ComponentName = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const tokenFromUrl = searchParams.get('token')
    const [email, setEmail] = useState('')
    const [resetToken, setResetToken] = useState('')
    const [error, setError] = useState('')
    const [isPending, setIsPending] = useState(false)

    useEffect(() => {
        const savedEmail = sessionStorage.getItem('pending_verification_email')
        const savedToken = sessionStorage.getItem('password_reset_token')
        if (!savedEmail || !savedToken) {
            router.push('/signIn')
            return
        }


        if (tokenFromUrl !== savedToken) {
            router.push('/signIn')
            return
        }
        setEmail(savedEmail)
        setResetToken(savedToken)
    }, [router, tokenFromUrl])

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setIsPending(true)

        const formData = new FormData(event.currentTarget)
        const data = Object.fromEntries(formData.entries())
        const validation = newPasswordSchema.safeParse(data)

        if (!validation.success) {
            setError(validation.error.issues[0].message)
            setIsPending(false)
            return
        }
        const { password, repeatPassword } = validation.data


        try {
            const response = await fetch(`/api/users/updatePassword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password,
                    repeatPassword, email, token: resetToken
                })
            })
            const resData = await response.json()

            if (!response.ok) {
                setError(resData.error || 'Something went wrong')
                setIsPending(false)
                return
            }
            const loginResult = await signIn('credentials', {
                email: email,
                password: data.password,
                redirect: false
            })
            if (loginResult?.error) {
                setError("Authorization failed. Please try logging in manually.")
                setIsPending(false)
            } else {
                sessionStorage.removeItem('pending_verification_email')
                sessionStorage.removeItem('password_reset_token')

                router.push("/")
                router.refresh()
            }

        } catch (error) {
            setIsPending(false)
            setError('Failed to connect to server')
        }



    }


    return (
        <div className={styles.formWrapper}>
            <form className={`${styles.form} container`} onSubmit={handleSubmit}>
                Set your new password
                <input className={styles.input} type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    required />
                <input className={styles.input} type="password"
                    name="repeatPassword"
                    id="repeatPassword"
                    placeholder="••••••••"
                    required />
                <button type="confirm"> confirm</button>

            </form>
        </div>
    )
}

export default ComponentName