'use client'

import styles from './AreYouSureModal.module.scss'

const AreYouSureModal = ({ changeModalStatus, handleClick, }) => {

    const handleOverlayClick = (e) => {

        if (e.target === e.currentTarget) {
            changeModalStatus()
        }

    }
    const yes = () => {
        handleClick()
    }

    const no = () => {
        changeModalStatus()
        return
    }
    return (
        <div onMouseDown={handleOverlayClick} className={styles.overlay} >
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h1 className={styles.h1}>вы уверены? </h1>
                <div className={styles.buttonsContainer}> 
                    <button onClick={yes}  type="submit" className={styles.yesButton}>
                        да
                    </button>
                    <button onClick={no} type="submit" className={styles.noButton}>
                        нет
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AreYouSureModal