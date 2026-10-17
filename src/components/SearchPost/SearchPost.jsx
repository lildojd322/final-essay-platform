'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from "react"
import styles from './SearchPost.module.scss'


const SearchPost = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const search = searchParams.get('search') || ''
        setSearchTerm(search)
    }, [searchParams])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (searchTerm.trim()) {
            router.push(`/blog?search=${searchTerm}`)
        } else {
            router.push(`/blog`)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.searchForm}>
            <input
                className={styles.searchInput}
                placeholder="найти задания"
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                value={searchTerm}
            />
            <button type="submit" className={styles.searchButton}>найти</button>
        </form>
    )
}

export default SearchPost