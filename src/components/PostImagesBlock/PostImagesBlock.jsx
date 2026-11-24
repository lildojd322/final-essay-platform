"use client"
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import { useState } from 'react'
import styles from './PostImagesBlock.module.scss'

const PostImagesBlock = ({ images }) => {
    const [index, setIndex] = useState(-1)

    return (
        <div>
            {images?.length > 0 && (
                <div className={styles.attachmentsGrid}>
                    {images.map((img, idx) => (
                        <img onClick={() => setIndex(idx)} key={idx} src={img} alt="Материал к заданию" className={styles.attachmentImage} />
                    ))}
                </div>
            )}
            <Lightbox
                open={index >= 0}
                index={index}
                close={() => setIndex(-1)}
                slides={(images || []).map((url) => ({ src: url }))}
                plugins={[Zoom]}
            />

        </div>
    )
}

export default PostImagesBlock