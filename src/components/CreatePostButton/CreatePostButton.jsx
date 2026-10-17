'use client'

import { useState } from 'react'
import styles from './CreatePostButton.module.scss'
import CreatePostModal from '../CreatePostModal/CreatePostModal'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'


const CreatePostButton = () => {
    const session = useSession()
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()


    const changeModalStatus = () => {
        if (session.status === 'unauthenticated') {
            router.push('/signin')
            return
        }
        if (isOpen === true) {
            setIsOpen(false)
        } else {
            setIsOpen(true)
        }
    }

    return (
        <>

            {!isOpen ? '' : <CreatePostModal isOpen={isOpen} changeModalStatus={changeModalStatus} />}
            <button onClick={changeModalStatus} className={styles.button}>
                <span> создать задание</span>
                <span className={styles.icon}>+</span>
            </button>
        </>
    )
}

export default CreatePostButton