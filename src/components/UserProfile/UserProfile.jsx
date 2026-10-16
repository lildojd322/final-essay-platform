'use client'

import defaultImage from '../../icons/avat.jpeg'
import styles from './UserProfile.module.scss'
import getHighResImage from '../../hooks/getHighResImage'
import { useSession } from "next-auth/react"
import LatestUserPosts from '../../components/LatestUserPosts/LatestUserPosts'

import { useEffect, useState } from 'react'
import ProfileLoading from '../ProfileLoading/ProfileLoading'


const UserProfile = ({ user }) => {
    const [lodaing, setLoading] = useState(true)

    if (!user) return <div className={styles.profileWrapper}>Loading...</div>
    useEffect(() => {
        setLoading(false)
    }, [])

    const { data: session } = useSession()
    if (lodaing) return <ProfileLoading />
    return (
        <div className={styles.profileWrapper}>
            <img
                src={getHighResImage(user.image) || defaultImage.src}
                alt="avatar"
                className={styles.avatar}
            />

            <h1 className={styles.name}>{user.name}</h1>
            <h2 className={styles.userId}> id: {user?.id}  {user.role && <p> {user.role}</p>} </h2>
            <LatestUserPosts id={user.id} name={user.name} />

        </div>
    )
}


export default UserProfile