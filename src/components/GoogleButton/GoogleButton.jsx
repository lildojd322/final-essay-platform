'use client'

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import styles from './GoogleButton.module.scss'

const GoogleButton = () => {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callackUrl') || '/profile'

    return (
        <div className={styles.googleContainer}>
            <h1 className={styles.h1}> войти при помощи google</h1>
            <button onClick={() => signIn('google', { callbackUrl })} className={styles.googleButton}> google</button>
        </div>
    )
}

export default GoogleButton