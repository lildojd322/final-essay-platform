import defaultImage from '../../icons/avat.jpeg'
import Link from 'next/link'
import styles from './Post.module.scss'
import { authConfig } from "@/lib/auth"
import { getServerSession } from "next-auth/next"
import { deletePostById } from '../../lib/db'
import DeleteButton from '../DeleteButton/DeleteButton'
import Comments from '../Comments/Comments'

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
        <>

            <div className={styles.postContainer}>

                <h1 className={styles.title}>{post.title}</h1>
                <p className={styles.body}>{post.body}</p>

                {isDeleted ? (
                    <pre className={styles.deletedUser}>удаленный аккаунт</pre>
                ) : (
                    <Link href={`/user/${user.id}`} className={styles.authorLink}>
                        <pre className={styles.authorName}>{authorName}</pre>
                        <img src={authorImage} className={styles.avatar} alt="avatar" />
                    </Link>
                )}

                <pre className={styles.meta}>создано: {formattedDate}</pre>
                {String(session?.user?.id) === String(user?.id) && <DeleteButton postId={post.id}> удалить задание</DeleteButton>}
            </div>
            <Comments author={user} id={post.id} />
        </>
    )
}

export default Post