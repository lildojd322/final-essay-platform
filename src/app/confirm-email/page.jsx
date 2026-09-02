import { getUserFromDBByToken, deleteUserById, updateUserVerificationToken } from '../../lib/db'
import { redirect } from "next/navigation"
import { signIn } from 'next-auth/react'

const ConfirmEmail = async ({ searchParams }) => {
    const params = await searchParams
    const token = params.token


    if (!token) {
        return (
            <div style={{ maxWidth: "450px", margin: "100px auto", textAlign: "center", fontFamily: "sans-serif" }}>
                <h2 style={{ color: "#ef4444" }}>
                    Activation error</h2>
                <p>Invalid or broken link. Token missing.</p>
            </div>
        )
    }

    try {
        const user = await getUserFromDBByToken(token)

        if (!user) {
            return (
                <div style={{ maxWidth: "450px", margin: "100px auto", textAlign: "center", fontFamily: "sans-serif" }}>
                    <h2 style={{ color: "#ef4444" }}>     Activation error</h2>
                    <p>
                        The link is invalid or this account has already been activated.</p>
                </div>
            )
        }

        const expirationTime = new Date(user.createdAt).getTime() + 60 * 60 * 1000

        if (Date.now() > expirationTime) {
            await deleteUserById(user.id)

            return (
                <div style={{ maxWidth: "450px", margin: "100px auto", textAlign: "center", fontFamily: "sans-serif" }}>
                    <h2 style={{ color: "#ef4444" }}>Link has expired</h2>
                    <p>The link's validity period (1 hour) has expired. Please register again.</p>
                </div>
            )
        }


        await updateUserVerificationToken(user.id)
    } catch (error) {
        console.error("SERVER CONFIRM ERROR:", error);
        return (
            <div style={{ maxWidth: "450px", margin: "100px auto", textAlign: "center", fontFamily: "sans-serif" }}>
                <h2>Server error</h2>
                <p>An internal error occurred during activation. Please try again later.</p>
            </div>
        )
    }



    redirect("/signin?verified=true")
}

export default ConfirmEmail