'use client'
import LatestUserPosts from '../../components/LatestUserPosts/LatestUserPosts'
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import styles from './Profile.module.scss'
import getHighResImage from '../../hooks/getHighResImage'
import defaultImage from '../../icons/avat.jpeg'
import ChangeAvatar from '../ChangeAvatar/ChangeAvatar'
import { use, useEffect, useState } from 'react'
import ProfileLoading from '../ProfileLoading/ProfileLoading'
import AreYouSureModal from '../AreYouSureModal/AreYouSureModal'
import { useRouter } from 'next/navigation'

const Profile = () => {
    const { data: session, update } = useSession()
    const user = session?.user
    const [userImageUrl, setUserImageUrl] = useState(user?.image || defaultImage.src)
    const provider = user?.provider
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)


    const onAvatarChange = async (file) => {
        const formData = new FormData()
        formData.append('avatar', file)

        const response = await fetch('/api/upload-avatar', {
            method: 'POST',
            body: formData
        })
        if (!response.ok) {
            const { error } = await response.json()
            return
        }

        const { url } = await response.json()
        setUserImageUrl(url)
        await update({ image: url })
    }

    useEffect(() => {
        if (user) {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user?.image) {
            setLoading(false)
            setUserImageUrl(user.image)
        }
    }, [user?.image])

    console.log(user?.id)

    const handleClick = async () => {
        fetch(`/api/users/deleteUser?id=${user?.id}`, {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                signOut({
                    callbackUrl: '/signin'
                })
                return
            })
            .catch(err => {
                console.error("error:", err)
                setLoading(false)
            })
    }
    const changeModalStatus = () => {
        isModalOpen ? setIsModalOpen(false) : setIsModalOpen(true)

    }
    if (loading) return (<ProfileLoading />)
    return (
        <div className={styles.profileContainer}>
            {user && (
                <>

                    <div className={styles.avatarBlock}>
                        <Image className={styles.userAvatar} src={getHighResImage(userImageUrl)} width={150} height={150} alt="user avatar" />
                        {provider === 'google' ? '' : <ChangeAvatar onAvatarChange={onAvatarChange} />}
                    </div>
                    <h1 className={styles.username}> {user?.name}</h1>
                    <h2 className={styles.userId}> id: {user?.id}  {/* {session.user.role && <p> {session.user.role}</p>} */} </h2>
                    <div className={styles.buttonContainer}>
                        <button className={styles.signOutButton} onClick={() => signOut({
                            callbackUrl: '/signin'
                        })} >sign out</button>
                        {user?.id === session?.user?.id && <button onClick={changeModalStatus} className={styles.signOutButton}>delete account</button>}

                        {isModalOpen && <AreYouSureModal changeModalStatus={changeModalStatus} handleClick={handleClick} />}
                    </div>

                </>
            )

            }

            <LatestUserPosts name={user?.name} id={user?.id} />
        </div>
    )
}

export default Profile