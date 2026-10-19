import Link from "next/link"
import GoogleButton from "../../components/GoogleButton/GoogleButton"
import { authConfig } from '../../lib/auth'
import SignInForm from '../../components/SigninForm/SignInForm'
import { getServerSession } from "next-auth/next"
import { redirect } from 'next/navigation'



const Signin = async () => {
    const session = await getServerSession(authConfig)

    if (session) {
        redirect("/profile")
    }

    return (
        <div className="authorizeContainer">

            <GoogleButton />
            <div>
                <p className="signOr">или войдите с помощью электронной почты</p>
            </div>
            <SignInForm />
            <div className="authFooter">
                <p>
                    Нет аккаунта?<Link href='/register'>Зарегистрируйтесь прямо сейчас</Link>
                </p>
                <p>
                    <Link href='/reset-password'>Забыли пароль?</Link>
                </p>
            </div>
        </div>
    )
}

export default Signin