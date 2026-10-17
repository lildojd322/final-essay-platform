'use client'
import { useEffect, useState } from "react"
import styles from './LatestUserPosts.module.scss'
import Link from "next/link"


const LatestUserPosts = ({ id, name }) => {

    const [latestPosts, setLatestPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [countPosts, setCountPosts] = useState(0)

    useEffect(() => {
        if (!id) return

        fetch(`/api/latestUserPosts?id=${id}`)
            .then(res => res.json())
            .then(data => {
                setLatestPosts(data.data.posts || [])
                setCountPosts(data.data.count || 0)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [id])



    return (
        <div>
            {latestPosts.length > 0 ? (
                <>
                    <div className={styles.postsInfo} >
                        <h2 >   всего заданий: {countPosts}</h2>
                        {countPosts > 3 && <Link href={`/blog?userId=${id}&name=${encodeURIComponent(name)}`} style={{ color: 'var(--primary)', textDecoration: 'underline', fontSize: '18px' }} >показать все</Link>}
                    </div>
                    <h1 className={styles.nameLatestTitle} style={{ marginTop: '10px' }}>
                        {`${name}`} последние задания

                    </h1>

                    <ul>
                        {latestPosts.map(post => (
                            <li key={post.id} className={styles.postItem}>
                                <div className={styles.title}>
                                    <Link href={`/blog/${post.id}`} className={styles.postLink}>
                                        {post.title}
                                    </Link>
                                </div>
                                <div className={styles.postMeta}>
                                    <span className={styles.date}>
                                        {new Date(post.created_at).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>

                </>
            ) : (
                <h1 className={styles.haventPosts}>
                    {name} не имеет заданий
                </h1>
            )}
        </div>
    )
}

export default LatestUserPosts