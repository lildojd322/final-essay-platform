'use client'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import styles from './PostsList.module.scss'
import { usePostStore } from '../../store/store'

const PostsList = (props) => {
    const { initialPosts, keyword, userId } = props
    const {
        storedPosts, setPosts,
        storedOffset, setOffset,
        storedHasMore, setHasMore,
        storedKeyword, setKeyword,
        reset
    } = usePostStore()

    const [loading, setLoading] = useState(false)

    const triggerRef = useRef(null)

    useEffect(() => {
        if (keyword !== storedKeyword || storedPosts.length === 0) {
            setKeyword(keyword)
            setPosts(initialPosts)
            setOffset(initialPosts.length)
            setHasMore(initialPosts.length >= 20)
        }
    }, [keyword, storedKeyword, initialPosts])

    const currentPosts = storedPosts.length > 0 ? storedPosts : initialPosts
    const currentOffset = storedPosts.length > 0 ? storedOffset : initialPosts.length
    const currentHasMore = storedPosts.length > 0 ? storedHasMore : (initialPosts.length >= 20)

    const loadMore = async () => {
        if (loading || !currentHasMore) return
        setLoading(true)

        try {
            const res = await fetch(
                userId
                    ? `/api/posts?offset=${currentOffset}&limit=20&userId=${userId}`
                    : keyword
                        ? `/api/posts?offset=${currentOffset}&limit=20&keyword=${encodeURIComponent(keyword)}`
                        : `/api/posts?offset=${currentOffset}&limit=20`
            )
            const newPosts = await res.json()

            if (newPosts.length < 20) setHasMore(false)

            setPosts([...currentPosts, ...newPosts])
            setOffset(currentOffset + 20)
        } catch (error) {
            console.error("Ошибка загрузки постов:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const observerTarget = triggerRef.current


        if (!observerTarget || !currentHasMore || loading) return

        const observer = new IntersectionObserver((entries) => {

            if (entries[0].isIntersecting) {
                loadMore()
            }
        }, {
            rootMargin: '200px'
        })

        observer.observe(observerTarget)

        return () => {
            if (observerTarget) observer.unobserve(observerTarget)
        }
    }, [currentOffset, currentHasMore, loading])

    return (
        <>
            <ul className={styles.postsList}>
                {currentPosts.length > 0 ? currentPosts.map((post) => (
                    <li key={post.id} className={styles.postItem}>
                        <div className={styles.title}>
                            <Link scroll={false} href={`/blog/${post.id}`} className={styles.postLink}>
                                {post.title}
                            </Link>
                        </div>
                        <div className={styles.postMeta}>
                            <span className={styles.author}>{post.author_name}</span>
                            <span className={styles.date}>
                                {new Date(post.created_at).toLocaleDateString('ru-RU')}
                            </span>
                        </div>
                    </li>
                )) : <h1>posts not found</h1>}
            </ul>
            {currentHasMore && (
                <div ref={triggerRef} className={styles.loadingTrigger} style={{ height: '30px', textAlign: 'center' }}>
                    {loading && <span style={{ display: 'block', fontWeight: '600', }}>загрузка...</span>}
                </div>
            )}
        </>
    )
}

export default PostsList
