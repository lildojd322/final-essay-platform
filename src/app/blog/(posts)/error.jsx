'use client'
const ErrorPage = ({ error }) => {
    return (
        <div className="error-container">
            <h2>ошибка!</h2>
            <p>{error.message}</p>

        </div>
    )
}

export default ErrorPage