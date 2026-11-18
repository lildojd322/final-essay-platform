"use client"

import { useState } from "react"
import styles from './SafeImage.module.scss'

const SafeImage = ({ src, alt, className, fallbackText = 'не удалось загрузить' }) => {
    const [hasError, setHasError] = useState(false)

    if (!src || hasError) {
        return (
            <div className={`${styles.fallback} ${className || ''}`} title={alt}>
                <span>{fallbackText}</span>
            </div>
        )
    }


    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
        />
    )
}

export default SafeImage