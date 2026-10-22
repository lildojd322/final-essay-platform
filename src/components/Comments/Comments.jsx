'use client'
import { useEffect, useState } from 'react'
import styles from './Comments.module.scss'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import defaulImage from '../../icons/avat.jpeg'
import { commentSchema } from '../../lib/zod'
import Answer from '../Answer/Answer'
import CreateCommentForm from '../CreateCommentForm/CreateCommentForm'

const Comments = ({ id, author }) => {
    const [comments, setComments] = useState([])
    const [countComments, setCountComments] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const router = useRouter()
    const session = useSession()

    const loadComments = async () => {
        if (!id) return

        try {
            const res = await fetch(`/api/comments/get?id=${id}`)
            const data = await res.json()
            setComments(data.data.comments || [])
            setCountComments(data.data.count || 0)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadComments()
        console.log(session.data)
    }, [id])

    const handleAction = async (event, parentId = '') => {
        event.preventDefault()

        if (session.status !== "authenticated") {
            router.push('/signin')
            return
        }

        if (isSubmitting) return


        const formData = new FormData(event.currentTarget)
        const data = Object.fromEntries(formData.entries())
        data.post_id = String(id)
        data.user_id = String(session?.data?.user?.id || '')
        data.parent_comment_id = parentId ? String(parentId) : null
        data.user_role = session.data.user.role
        const validation = commentSchema.safeParse(data)
        if (!validation.success) {
            const firstError = validation.error.issues[0]?.message || 'ошибка валидации'
            setError(firstError)
            return
        }
        setError(false)
        setIsSubmitting(true)

        try {
            const res = await fetch(`/api/comments/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) throw new Error('ошибка сервера')


            await loadComments()

            event.target.reset()

        } catch (err) {
            console.error(err)
            setError('Не удалось создать комментарий')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (commentId) => {
        try {
            const res = await fetch(`/api/comments/delete?id=${commentId}`, {
                method: 'DELETE',
            })

            if (!res.ok) throw new Error('ошибка удаления')

            await loadComments()

        } catch (error) {
            console.error(error)
            setError('Не удалось удалить комментарий')
        }
    }

    if (loading) return <div>загрузка...</div>



    return (
        <div className={styles.discussionContainer}>
            <h1>обсуждение</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <CreateCommentForm
                handleAction={handleAction}
                isSubmitting={isSubmitting}
            />

            <div className={styles.commentsSection}>
                <h2>всего комментариев: {countComments}</h2>
                <ul className={styles.commentsList}>
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <li
                                style={{
                                    marginLeft: comment.parent_comment_id ? '45px' : '0px'
                                }}
                                key={comment.comment_id}
                            >
                                <div className={styles.justInfoBlock}>
                                    <div className={styles.info}>
                                        <Link href={`/user/${comment.user_id}`} className={styles.authorInfo}>
                                            <img
                                                width={50}
                                                height={50}
                                                src={comment.author_avatar || defaulImage.src}
                                                className={styles.authorAvatar}
                                                alt="avatar"
                                            />
                                            <div className={`${styles.authorName} ${String(author?.id) === String(comment.user_id) && styles.isAuthor}`}>
                                                {comment.author_name}
                                            </div>
                                        </Link>
                                        <div className={styles.commentCreated}>
                                            {new Date(comment.created_at).toLocaleDateString('ru-RU', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                        <div className={styles.userRole}>
                                            {comment.user_role === 'teacher' ? <p> учитель</p> : <p> ученик</p>}

                                        </div>
                                    </div>
                                    {session?.data?.user && String(comment.user_id) === String(session.data.user.id) && (
                                        <button
                                            onClick={() => handleDelete(comment.comment_id)}
                                            className={styles.deleteButton}
                                        >

                                            удалить
                                        </button>
                                    )}
                                </div>
                                <div className={styles.commentText}>
                                    {comment.parent_comment_id && (
                                        <Link
                                            className={styles.parentAuthor}
                                            style={{ marginRight: '5px' }}
                                            href={`/user/${comment.parent_author_id}`}
                                        >
                                            @{comment.parent_author_name}
                                        </Link>
                                    )}
                                    {comment.comment_text}
                                </div>
                                <div className={styles.interactionBlock}>
                                    <Answer
                                        parentId={comment.comment_id}
                                        handleAction={handleAction}
                                        isSubmitting={isSubmitting}
                                    />
                                </div>
                            </li>
                        ))
                    ) : (
                        <h2 style={{ fontStyle: 'italic' }}>комментариев пока нет</h2>
                    )}
                </ul>
            </div>
        </div>
    )
}

export default Comments