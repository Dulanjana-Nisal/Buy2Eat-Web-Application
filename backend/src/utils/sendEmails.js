const nodemailer = require('nodemailer');
const { EMAIL_APP_PASSWORD, EMAIL_USER } = require('../config/env');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_APP_PASSWORD,
    },
})

const sendEmailOTP = async (email, otp) => {
    await transporter.sendMail({
        from: `"buy2eat Food delivery" < ${EMAIL_USER} >`,
        to: email,
        subject: 'Your buy2eat verification code',
        text: `
            We received a request to sign in to your buy2eat account.

Your verification code is: ${otp}

This code expires in 5 minutes.

If you didn't request this code, you can safely ignore this email.

MyFood Team
    `,
        html: `
        <div>
            <h2>Login verification</h2>

            <p>We received a request to sign in to your buy2eat account.</p>

            <h1>${otp}</h1>

            <p>This code expires in <strong>5 minutes</strong>.</p>

            <p>
                If you didn't request this code,
                you can safely ignore this email.
            </p>

            <p>buy2eat Team</p>
        </div>
        `
    })
}

module.exports = sendEmailOTP;