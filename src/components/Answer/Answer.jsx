'use client'

import { useRef, useState } from 'react'
import styles from './Answer.module.scss'

const Answer = ({ handleAction, parentId }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [text, setText] = useState('')
    const areaRef = useRef(null)

    const changeStatus = () => {

        !isOpen ? setIsOpen(true) : setIsOpen(false)
    }

    const handleClick = (event) => {
        event.preventDefault()
        changeStatus()
    }


    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()

            const form = event.currentTarget.form
            if (form) {
                form.requestSubmit()
            }
        }

    }
    const handleSubmit = async (event) => {
        event.preventDefault()
        await handleAction(event, parentId)
        setText('')
    }

    return (

        <>

            {isOpen ? <form onSubmit={handleSubmit} className={styles.answerForm}>
                <textarea onKeyDown={handleKeyDown} value={text} onChange={(e) => {
                    setText(e.target.value)
                }} autoFocus ref={areaRef} className={styles.textarea} name="comment_text" type="text" placeholder="текст ответа"></textarea>
                <div>
                    <button onClick={handleClick} type='click' className={styles.cancelAnswerButton}>отменить</button>
                    <button disabled={!text.trim()} type='submit' className={styles.sendAnswerButton}> отправить</button>

                </div>

            </form> : <button onClick={handleClick} className={styles.button}>ответить</button>}


        </>
    )
}

export default Answer