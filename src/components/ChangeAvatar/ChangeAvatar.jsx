'use client'
import styles from './ChangeAvatar.module.scss'
import { useRef } from 'react'


const ChangeAvatar = ({ onAvatarChange }) => {
    const inputRef = useRef(null)
    const handleClick = () => {
        inputRef.current.click()
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0]

        if (file && onAvatarChange) {
            onAvatarChange(file)
        }
        event.target.value = ''
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            <button className={styles.changeAvatarButton} onClick={handleClick} title="сменить аватарку">

                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                </svg>
            </button> </>
    )
}

export default ChangeAvatar
