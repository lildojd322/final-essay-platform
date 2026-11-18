import defaultImage from '../../icons/avat.jpeg'
import Link from 'next/link'
import styles from './Post.module.scss'
import { authConfig } from "@/lib/auth"
import { getServerSession } from "next-auth/next"
import { deletePostById } from '../../lib/db'
import DeleteButton from '../DeleteButton/DeleteButton'
import Comments from '../Comments/Comments'
import SafeImage from '../SafeImage/SafeImage'

const Post = async ({ post, user }) => {
    const session = await getServerSession(authConfig)

    const authorName = user?.name || 'удаленный аккаунт'
    const authorImage = user?.image || defaultImage.src
    const isDeleted = !user



    const formattedDate = new Date(post.created_at).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })



    return (
        <div className={styles.pageWrapper}>
            <article className={styles.taskCard}>
                <h1 className={styles.title}>{post.title}</h1>
                <div className={styles.body}>{post.body}</div>

                {/*  под будущие фото  */}
                {post.images?.length > 0 && (
                    <div className={styles.attachmentsGrid}>
                        {post.images.map((img, idx) => (
                            <img key={idx} src={img} alt="Материал к заданию" className={styles.attachmentImage} />
                        ))}
                    </div>
                )}

                <footer className={styles.taskFooter}>
                    <div className={styles.authorBlock}>
                        {isDeleted ? (
                            <span className={styles.deletedUser}>удаленный аккаунт</span>
                        ) : (
                            <Link href={`/user/${user.id}`} className={styles.authorLink}>
                                <SafeImage
                                    src={authorImage}
                                    alt="avatar"
                                    className={styles.avatar}
                                    fallbackText="нет "
                                />
                                <span className={styles.authorName}>{authorName}</span>
                            </Link>
                        )}
                    </div>

                    <div className={styles.metaActions}>
                        <span className={styles.meta}>{formattedDate}</span>
                        {String(session?.user?.id) === String(user?.id) && (
                            <DeleteButton postId={post.id}>удалить</DeleteButton>
                        )}
                    </div>
                </footer>
            </article>

            <Comments author={user} id={post.id} />
        </div>
    )
}

export default Post