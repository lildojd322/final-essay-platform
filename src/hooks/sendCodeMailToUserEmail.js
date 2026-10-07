import { z } from "zod"
import { createTransport } from "nodemailer"
import crypto from 'crypto'
import { redis } from '@/lib/redis'


export async function sendCodeMailToUserEmail(email, name) {



    const confirmationCode = crypto.randomInt(100000, 999999).toString()

    const cleanEmail = email.trim().toLowerCase()



    await redis.set(`auth_code:${cleanEmail}`, confirmationCode, { ex: 3600 })


    const transport = createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: true,
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }

    })



    await transport.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Mail confirmation code',
        html: `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F7F1DE; font-family: 'JetBrains Mono', 'Courier New', monospace; padding: 40px 20px;">
    <tr>
        <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #FFFFFF; border: 1px solid #E2DAC4; border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(78, 34, 15, 0.04);">

                <tr>
                    <td align="center" style="padding-bottom: 24px;">
                        <span style="font-size: 20px; font-weight: 700; color: #4E220F; letter-spacing: -0.5px;">Final Essay Platform</span>
                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding-bottom: 12px;">
                        <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #4E220F; line-height: 1.3;">Hello, ${name}!</h2>
                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding-bottom: 24px;">
                        <p style="margin: 0; font-size: 15px; color: #4E220F; line-height: 1.5; opacity: 0.8;">To confirm your action on the website, please enter the one-time security code below:</p>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding-bottom: 24px;">
                        <div style="display: inline-block; background-color: #F7F1DE; color: #9D6638; font-size: 32px; font-weight: 700; letter-spacing: 6px; padding: 16px 32px; border-radius: 8px; border: 1px dashed #9D6638; font-family: 'JetBrains Mono', 'Courier New', monospace;">
                            ${confirmationCode}
                        </div>
                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding-bottom: 24px;">
                        <p style="margin: 0; font-size: 13px; color: #9D6638; font-weight: 500;">The code will expire in 1 hour.</p>
                    </td>
                </tr>

                <tr>
                    <td style="border-top: 1px solid #E2DAC4; padding-top: 24px;">
                        <p style="margin: 0; font-size: 12px; color: #4E220F; line-height: 1.5; opacity: 0.6; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
        `
    })








}