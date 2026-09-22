const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const registrationOtpModel = require('../models/registrationOtpModel');
const maskEmail = require('../utils/maskEmail');
const { sendEmailOTP } = require('../utils/sendEmails');

const OTPHelper = async (normalizedEmail, role, hashedPassword, profile_data) => {

    // check roles are valid
    if (!['customer','seller'].includes(role)) {
        return {
            code: 400,
            success: false,
            message: 'Wrong role selecting!',

        }
    }

    // generate otp
    const generateOtp = crypto.randomInt(100000, 1000000).toString();
    const hashOtp = await bcrypt.hash(generateOtp, 10);

    // generate verification_id 
    const verification_id_value = crypto.randomUUID();

    // delete old OTP from same email
    await registrationOtpModel.deleteMany({ email: normalizedEmail })

    // save otp in database
    const nowDate = new Date();
    const otpCreation = await registrationOtpModel.create({
        verification_id: verification_id_value,
        email: normalizedEmail,
        hash_otp: hashOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // expires in 5 min
        session_expiresAt: new Date(nowDate.getTime() + 30 * 60 * 1000), // session expires in 30 min
        role: role,
        hash_password: hashedPassword,
        profile_data: profile_data,
    })

    // if something wrong wile create database schema
    if (!otpCreation) {
        throw new Error('Error while create database schema!')
    }

    // mask email for sending otp
    const maskedEmail = maskEmail(normalizedEmail);

    // send otp via email
    await sendEmailOTP(normalizedEmail, profile_data.first_name, profile_data.last_name, generateOtp)

    // return data
    return {
        code: 200,
        success: true,
        message: 'OTP send successfully...',
        verification_id: verification_id_value,
        masked_email: maskedEmail,
        expiresAt: otpCreation.expiresAt

    }
}

module.exports = OTPHelper;