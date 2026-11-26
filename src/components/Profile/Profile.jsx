'use client'
import LatestUserPosts from '../../components/LatestUserPosts/LatestUserPosts'
import { useSession, signOut } from "next-auth/react"
import styles from './Profile.module.scss'
import getHighResImage from '../../hooks/getHighResImage'
import defaultImage from '../../icons/avat.jpeg'
import ChangeAvatar from '../ChangeAvatar/ChangeAvatar'
import { useEffect, useState, useRef } from 'react'
import ProfileLoading from '../ProfileLoading/ProfileLoading'
import AreYouSureModal from '../AreYouSureModal/AreYouSureModal'
import SafeImage from '../SafeImage/SafeImage'

const Profile = () => {
    const { data: session, update } = useSession()
    const user = session?.user
    const [userImageUrl, setUserImageUrl] = useState(user?.image || defaultImage.src)
    const provider = user?.provider
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuRef = useRef(null)

    const avatarSrc = provider === 'google'
        ? getHighResImage(userImageUrl)
        : userImageUrl

    const onAvatarChange = async (file) => {
        const formData = new FormData()
        formData.append('avatar', file)

        const response = await fetch('/api/upload-avatar', {
            method: 'POST',
            body: formData
        })
        if (!response.ok) return

        const { url } = await response.json()
        setUserImageUrl(url)
        await update({ image: url })
    }

    useEffect(() => {
        if (user) setLoading(false)
    }, [user])

    useEffect(() => {
        if (user?.image) {
            setLoading(false)
            setUserImageUrl(user.image)
        }
    }, [user?.image])

    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleClick = async () => {
        fetch(`/api/users/deleteUser?id=${user?.id}`, {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(() => {
                signOut({ callbackUrl: '/signin' })
            })
            .catch(err => {
                console.error("error:", err)
                setLoading(false)
            })
    }

    const changeModalStatus = () => {
        setIsModalOpen(prev => !prev)
        setIsMenuOpen(false) 
    }

    if (loading) return (<ProfileLoading />)

    return (
        <div className={styles.profileContainer}>
            {user && (
                <>

                    <div className={styles.settingsWrapper} ref={menuRef}>
                        <button
                            type="button"
                            className={styles.gearButton}
                            onClick={() => setIsMenuOpen(prev => !prev)}
                            aria-label="Настройки профиля"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </button>

                        {isMenuOpen && (
                            <div className={styles.dropdownMenu}>
                                <button
                                    type="button"
                                    className={styles.menuItem}
                                    onClick={() => signOut({ callbackUrl: '/signin' })}
                                >
                                    Выйти из аккаунта
                                </button>

                                {user?.id === session?.user?.id && (
                                    <button
                                        type="button"
                                        className={`${styles.menuItem} ${styles.dangerItem}`}
                                        onClick={changeModalStatus}
                                    >
                                        Удалить аккаунт
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className={styles.avatarBlock}>
                        <SafeImage
                            src={avatarSrc}
                            alt="user avatar"
                            className={styles.userAvatar}
                        />
                        {provider === 'google' ? '' : <ChangeAvatar onAvatarChange={onAvatarChange} />}
                    </div>

                    <h1 className={styles.username}>{user?.name}</h1>
                    <h2 className={styles.userId}>
                        id: {user?.id} {session?.user?.role === 'teacher' ? <span>учитель</span> : <span>ученик</span>}
                    </h2>

                    {isModalOpen && (
                        <AreYouSureModal
                            changeModalStatus={changeModalStatus}
                            handleClick={handleClick}
                        />
                    )}
                </>
            )}

            <LatestUserPosts name={user?.name} id={user?.id} />
        </div>
    )
}

export default Profile
