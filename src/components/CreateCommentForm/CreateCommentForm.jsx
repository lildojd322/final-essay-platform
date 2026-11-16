'use client'
import styles from './CreateCommentForm.module.scss'
import { commentSchema } from '../../lib/zod'
import { useState } from 'react'

const CreateCommentForm = ({ handleAction, isSubmitting = false }) => {
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



    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

    return (
        <form className={styles.commentForm} onSubmit={handleSubmit}>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                name="comment_text"
                placeholder="написать ответ или вариант сочинения..."
                rows={3}
            />

            <div className={styles.formBottom}>
                <span className={styles.wordCounter}>слов: {wordCount}</span>

                <button
                    disabled={!text.trim() || isSubmitting}
                    type="submit"
                    className={styles.submitButton}
                >
                    отправить
                </button>
            </div>
        </form>
    )
}

export default CreateCommentForm