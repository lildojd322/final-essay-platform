'use client'


import { postSchema } from '../../lib/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './CreatePostModal.module.scss'
import { useSession } from "next-auth/react"
import { usePostStore } from '../../store/store'


const CreatePostModal = ({ isOpen, changeModalStatus }) => {
    const [error, setError] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()
    const session = useSession()
    const { reset, deleteOptimisticPost, addOptimisticPost, updateOptimisticPost } = usePostStore()


    const handleOverlayClick = (e) => {

        if (e.target === e.currentTarget) {
            changeModalStatus()
        }


    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        const formData = new FormData(event.currentTarget)

        const data = Object.fromEntries(formData.entries())


        const validation = postSchema.safeParse(data)

        if (!validation.success) {
            const firstError = validation.error.issues[0].message
            setError(firstError)
            return
        }
        const tempPost = {
            id: Date.now(),
            title: validation.data.title,
            description: validation.data.description,
            created_at: new Date().toISOString(),
            author_name: session?.data?.user?.name || 'anonymous',
            userId: session?.data?.user?.id || session?.data?.user?.sub || ''

        }
        addOptimisticPost(tempPost)

        setIsPending(true)

        const response = await fetch('/api/createPost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validation.data)
        })


        if (response.ok) {
            const result = await response.json()

            const realPost = {
                ...tempPost,
                id: result.id 
            }
            updateOptimisticPost(tempPost.id, realPost)
            changeModalStatus()
            router.refresh()
        } else {
            const result = await response.json()
            setError(result.error || 'failed')
            deleteOptimisticPost(tempPost.id)
            setIsPending(false)
        }
    }



    return (
        <div onMouseDown={handleOverlayClick} className={styles.overlay} >
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h1 className={styles.h1}>создать задание</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}
                    <input
                        type="text"
                        name="title"
                        placeholder="название"
                        required
                        className={styles.input}

                    />
                    <textarea
                        name="description"
                        placeholder="описание"
                        required
                        className={styles.textarea}
                    />
                    <button disabled={isPending} type="submit" className={styles.submitButton}>
                        создать
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreatePostModal