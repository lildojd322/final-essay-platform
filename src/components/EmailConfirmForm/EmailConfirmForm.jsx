'use client'
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import OtpInput from 'react-otp-input'
import styles from './EmailConfirmForm.module.scss'
import { signIn } from "next-auth/react"

const EmailConfirmForm = () => {
    const router = useRouter()
    const [error, setError] = useState('')
    const [code, setCode] = useState('')
    const [isPending, setIsPending] = useState(false)
    const [email, setEmail] = useState("")

    useEffect(() => {
        const savedEmail = sessionStorage.getItem('pending_verification_email')
        if (!savedEmail) {
            router.push('/signIn')
        }
        else {
            setEmail(savedEmail)
        }

    }, [router])

    const onSubmit = async (event) => {
        event.preventDefault()
        setError("")

        if (code.length !== 6) {
            setError("Please enter all 6 digits.")
            return
        }

        setIsPending(true)

        const response = await fetch(`/api/users/confirmationToken/match`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        })

        const data = await response.json()
        setIsPending(false)

        if (data.success) {
            sessionStorage.removeItem('pending_verification_email')

            const loginResult = await signIn('credentials', {
                email: email,
                password: data.bypassToken,
                redirect: false
            })
            if (loginResult?.error) {
                setError("Authorization failed. Please try logging in manually.")
                setIsPending(false)
            } else {
                router.push("/")
                router.refresh()
            }
        } else {
            setError(data.error || "Incorrect code.")
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Verify Your Email</h1>
                    <p className={styles.subtitle}>
                        We have sent a 6-digit confirmation code to <strong>{email}</strong>. Please enter it below to activate your account.
                    </p>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <form onSubmit={onSubmit} className={styles.form}>
                    <OtpInput
                        value={code}
                        onChange={setCode}
                        numInputs={6}
                        shouldAutoFocus={true}
                        inputType="tel"
                        renderSeparator={<div style={{ width: '6px' }}></div>}
                        containerClassName="js-otp-input-container"
                        renderInput={(props) => (
                            <input
                                {...props}
                                className={styles.input}
                            />
                        )}
                    />

                    <button
                        className={styles.button}
                        style={{ width: '200px' }}
                        type="submit"
                        isPending={isPending}
                    >
                        check the code
                    </button>
                </form>
            </div>
        </div>
    )
}

export default EmailConfirmForm