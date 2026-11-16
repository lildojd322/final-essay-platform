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
  <section className={styles.discussionContainer}>
    <div className={styles.sectionHeader}>
      <h2>Ответы и разбор задания</h2>
      <span className={styles.counterBadge}>{countComments}</span>
    </div>

    {error && <p className={styles.errorText}>{error}</p>}

    <CreateCommentForm handleAction={handleAction} isSubmitting={isSubmitting} />

    <div className={styles.commentsSection}>
      {comments.length > 0 ? (
        <ul className={styles.commentsList}>
          {comments.map((comment) => {
            const isTeacher = comment.user_role === 'teacher';
            const isReply = Boolean(comment.parent_comment_id);

            return (
              <li
                key={comment.comment_id}
                className={`${styles.commentItem} ${isReply ? styles.replyItem : ''} ${
                  isTeacher ? styles.teacherItem : ''
                }`}
              >
                <div className={styles.justInfoBlock}>
                  <div className={styles.info}>
                    <Link href={`/user/${comment.user_id}`} className={styles.authorInfo}>
                      <img
                        src={comment.author_avatar || defaulImage.src}
                        className={styles.authorAvatar}
                        alt="avatar"
                      />
                      <span
                        className={`${styles.authorName} ${
                          String(author?.id) === String(comment.user_id) ? styles.isAuthor : ''
                        }`}
                      >
                        {comment.author_name}
                      </span>
                    </Link>

                    <span className={`${styles.userRole} ${isTeacher ? styles.roleTeacher : ''}`}>
                      {isTeacher ? 'Учитель' : 'Ученик'}
                    </span>

                    <time className={styles.commentCreated}>
                      {new Date(comment.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>

                  {session?.data?.user &&
                    String(comment.user_id) === String(session.data.user.id) && (
                      <button
                        onClick={() => handleDelete(comment.comment_id)}
                        className={styles.deleteButton}
                      >
                        Удалить
                      </button>
                    )}
                </div>

                <div className={styles.commentText}>
                  {isReply && (
                    <Link
                      className={styles.parentAuthor}
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
            );
          })}
        </ul>
      ) : (
        <div className={styles.emptyState}>
          Пока никто не прислал ответ или вопрос по этому заданию.
        </div>
      )}
    </div>
  </section>
);
}

export default Comments