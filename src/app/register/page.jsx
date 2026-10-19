import RegisterForm from "../../components/RegisterForm/RegisterForm"
import Link from "next/link"


const Register = () => {
    return (
        <div>

            <RegisterForm />
            <div className="authFooter">
                <p>
                    Уже есть аккаунт? <Link href='/signin'>Войдите </Link>

                </p>
            </div>
        </div >
    )
}

export default Register