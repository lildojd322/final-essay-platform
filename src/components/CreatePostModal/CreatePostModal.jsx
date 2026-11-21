'use client'

import { postSchema } from '../../lib/zod'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './CreatePostModal.module.scss'
import { useSession } from "next-auth/react"
import { usePostStore } from '../../store/store'

const CreatePostModal = ({ isOpen, changeModalStatus }) => {
    const [error, setError] = useState('')
    const [isPending, setIsPending] = useState(false)
    const [imageFiles, setImageFiles] = useState([])

    const router = useRouter()
    const session = useSession()
    const inputRef = useRef(null)
    const { deleteOptimisticPost, addOptimisticPost, updateOptimisticPost } = usePostStore()


    if (!isOpen) return null


    const closeAndReset = () => {
        imageFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl))
        setImageFiles([])
        setError('')
        setIsPending(false)
        changeModalStatus()
    }

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !isPending) {
            closeAndReset()
        }
    }

    const handleClick = () => {
        inputRef.current?.click()
    }

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files || [])
        if (selectedFiles.length === 0) return

        const newImages = selectedFiles.slice(0, 5 - imageFiles.length).map((file) => ({
            id: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file)
        }))

        setImageFiles((prev) => [...prev, ...newImages])
        e.target.value = ''
    }

    const handleRemoveImage = (idToRemove) => {
        setImageFiles((prev) => {
            const target = prev.find((img) => img.id === idToRemove)
            if (target) URL.revokeObjectURL(target.previewUrl)
            return prev.filter((img) => img.id !== idToRemove)
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        const formData = new FormData(event.currentTarget)

        const validation = postSchema.safeParse({
            title: formData.get('title'),
            description: formData.get('description'),
            images: imageFiles.map((item) => item.file),
        })

        if (!validation.success) {
            setError(validation.error.issues[0].message)
            return
        }

        const tempPost = {
            id: Date.now(),
            title: validation.data.title,
            description: validation.data.description,
            images: imageFiles.map((item) => item.previewUrl),
            created_at: new Date().toISOString(),
            author_name: session?.data?.user?.name || 'учитель',
            userId: session?.data?.user?.id || session?.data?.user?.sub || ''
        }

        addOptimisticPost(tempPost)
        setIsPending(true)

        try {
            const payload = new FormData()
            payload.append('title', validation.data.title)
            payload.append('description', validation.data.description)
            imageFiles.forEach((item) => {
                payload.append('images', item.file)
            })

            const response = await fetch('/api/createPost', {
                method: 'POST',
                body: payload
            })

            const result = await response.json()

            if (response.ok) {
                const realPost = {
                    ...tempPost,
                    id: result.id,
                    images: result.images || tempPost.images
                }
                updateOptimisticPost(tempPost.id, realPost)
                closeAndReset() 
                router.refresh()
            } else {
                setError(result.error || 'Не удалось создать задание')
                deleteOptimisticPost(tempPost.id)
                setIsPending(false)
            }
        } catch (err) {
            console.error('Submit error:', err)
            setError('Ошибка сети или сервера')
            deleteOptimisticPost(tempPost.id)
            setIsPending(false)
        }
    }

    return (
        <div onMouseDown={handleOverlayClick} className={styles.overlay}>
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
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    {imageFiles.length < 5 && (
                        <button type="button" className={styles.fileAdder} onClick={handleClick}>
                            добавить фотографии ({imageFiles.length}/5) +
                        </button>
                    )}

                    {imageFiles.length > 0 && (
                        <ul className={styles.previewList}>
                            {imageFiles.map((item) => (
                                <li key={item.id} className={styles.previewItem}>
                                    <img src={item.previewUrl} alt="превью" className={styles.previewImage} />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(item.id)}
                                        className={styles.removeOverlay}
                                        title="Удалить"
                                    >
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <button disabled={isPending} type="submit" className={styles.submitButton}>
                        {isPending ? 'создание...' : 'создать'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreatePostModal
