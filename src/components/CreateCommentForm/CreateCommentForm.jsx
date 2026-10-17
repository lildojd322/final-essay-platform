'use client'
import styles from './CreateCommentForm.module.scss'
import { commentSchema } from '../../lib/zod'
import { useState } from 'react'

const CreateCommentForm = ({ handleAction }) => {
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const [text, setText] = useState('')


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
        await handleAction(event)
        setText('')
    }



    return (


        <form className={styles.commentForm} onSubmit={handleSubmit}>
            <textarea
                value={text}
                onChange={(e) => {
                    setText(e.target.value)
                }} onKeyDown={handleKeyDown} name="comment_text" type="text" placeholder="оставить комментарий"></textarea>
            <button
                disabled={!text.trim()}
                type="submit"

            >
                отправить
            </button>
        </form>
    )
}

export default CreateCommentForm