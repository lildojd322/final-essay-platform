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
                <p className="signOr">or sign in with email</p>
            </div>
            <SignInForm />
            <div className="authFooter">
                <p>
                    Don't have an account? <Link href='/register'>Register right now</Link>
                </p>
                <p>
                    <Link href='/reset-password'>forgot your password?</Link>
                </p>
            </div>
        </div>
    )
}

export default Signin