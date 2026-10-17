'use client'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import styles from './Navigation.module.scss'
import { useSession } from "next-auth/react"
import Image from "next/image"
import getHighResImage from '../../hooks/getHighResImage'
import defaultImage from '../../icons/avat.jpeg'
import { useRef, useEffect, useState } from "react"
import NavigationLoading from '../NavigationLoading/NavigationLoading'

import SwitchTheme from '@/components/SwitchTheme/SwitchTheme'

const Navigation = ({ navLinks }) => {
    const pathname = usePathname()
    const session = useSession()
    const [userImageUrl, setUserImageUrl] = useState(session?.data?.user?.image || defaultImage.src)

    const checkboxRef = useRef(null)

    useEffect(() => {
        if (session?.data?.user?.image) {
            setUserImageUrl(session?.data?.user?.image)
        }
    }, [session?.data?.user?.image])


    const closeMenu = () => {
        if (checkboxRef.current) {
            checkboxRef.current.checked = false
        }
    }

    return (
        <>

            {session.status === 'loading' ? <NavigationLoading /> : <> <div className={styles.leftSection}>

                <input ref={checkboxRef} className={styles.checkbox} id="burger" type="checkbox" />
                <label className={styles.burgerLabel} htmlFor="burger">
                    <div className={styles.stickContainer}>


                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </label>
                <div className={styles.burgerNav}>

                    <nav className={styles.bnav}>
                        {session.status === 'loading' && <span>Загрузка...</span>}
                        {session.status === 'authenticated' && session?.data?.user && (
                            <Link onClick={closeMenu} style={{ height: '60px', width: '60px' }} href="/profile">
                                <Image onClick={closeMenu} className={styles.burgerUserAvatar}
                                    src={getHighResImage(userImageUrl)}
                                    alt="avatar"
                                    width={32}
                                    height={32}
                                    style={{ width: 60, height: 60, borderRadius: '50%' }}
                                />
                            </Link>
                        )}
                        {session.status === 'unauthenticated' && (
                            <Link onClick={closeMenu} href="/api/auth/signin" className={styles.signInButtonIntoBurger}>войти</Link>
                        )}
                        {navLinks.map(link => {
                            const isActive = pathname === link.href
                            return (
                                <Link onClick={closeMenu} key={link.label} className={`${styles.link} ${isActive ? styles.active : ''}`} href={link.href}> {link.label} </Link>
                            )
                        })}
                    </nav>

                </div>
            </div>
                <nav className={styles.nav}>
                    {navLinks.map(link => {
                        const isActive = pathname === link.href
                        return (
                            <Link key={link.label} className={`${styles.link} ${isActive ? styles.active : ''}`} href={link.href}> {link.label} </Link>
                        )
                    })}
                </nav>
                <div className={styles.rightSection}>
                    {session.status === 'loading' && <span>Загрузка...</span>}
                    {session.status === 'authenticated' && session?.data?.user && (
                        <Link style={{ marginRight: '20px', height: '32px', width: '32px' }} href="/profile">
                            <Image className={styles.userAvatar}
                                src={getHighResImage(userImageUrl)}
                                alt="avatar"
                                width={32}
                                height={32}
                                style={{ width: 32, height: 32, borderRadius: '50%' }}
                            />
                        </Link>
                    )}
                    {session.status === 'unauthenticated' && (
                        <Link href="/api/auth/signin" className={styles.signInButton}>войти</Link>
                    )}
                    <SwitchTheme />
                </div></>}

        </>
    )
}

export default Navigation