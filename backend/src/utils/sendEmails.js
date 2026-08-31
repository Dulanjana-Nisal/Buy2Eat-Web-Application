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

const resendEmailOTP = async (email, otp) => {

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

const sendEmailResetPassword = async (email, resetLink) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
        <div style="max-width: 480px; margin: 0 auto; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Hi there,</p>
          <p>We received a request to reset your password for your Buy2Eat account. Click the button below to choose a new one:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background-color: #ff6600; color: #ffffff; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #555;">${resetLink}</p>
          <p>This link will expire in 15 minutes. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
          <p>Thanks,<br/>The Buy2Eat Team</p>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Buy2Eat" <${EMAIL_USER}>`,
    to: email,
    subject: "Reset your Buy2Eat password",
    text: `Hi there,\n\nWe received a request to reset your password. Use the link below to reset it:\n${resetLink}\n\nThis link expires in 15 minutes. If you didn't request this, you can ignore this email.\n\n- The Buy2Eat Team`,
    html: htmlContent,
    replyTo: EMAIL_USER,
  });
};

module.exports = { sendEmailOTP, resendEmailOTP, sendEmailResetPassword };