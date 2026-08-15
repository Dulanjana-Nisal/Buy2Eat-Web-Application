const nodemailer = require('nodemailer');
const { EMAIL_APP_PASSWORD, EMAIL_USER } = require('../config/env');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_APP_PASSWORD,
    },
})

const sendEmailOTP = async (email, first_name, last_name, otp) => {

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 8px; padding: 32px; }
        .otp-box { font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; background: #f0f4ff; color: #2c3e50; padding: 16px; border-radius: 6px; margin: 24px 0; }
        .footer { font-size: 12px; color: #888; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Verify Your Identity</h2>
        <p>Hi ${first_name} ${last_name},</p>
        <p>Use the following One-Time Password (OTP) to complete your verification:</p>
        <div class="otp-box">${otp}</div>
        <p>This code will expire in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Buy2Eat. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

    await transporter.sendMail({
        from: `"Buy2Eat" <${EMAIL_USER}>`,
        to: email,
        subject: "Your OTP Code for Buy2Eat",
        text: `Hi there, your OTP code is ${otp}. It expires in 5 minutes.`,
        html: htmlContent,
        replyTo: EMAIL_USER,
    })
}

module.exports = sendEmailOTP;