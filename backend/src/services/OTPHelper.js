const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const registrationOtpModel = require('../models/registrationOtpModel');
const maskEmail = require('../utils/maskEmail');
const { sendEmailOTP } = require('../utils/sendEmails');

// OTPHelper Service function
const OTPHelper = async ({
    normalizedEmail,
    role,
    hashedPassword,
    profile_data,
    session = null
}) => {

    // check roles are valid
    if (!['customer', 'seller'].includes(role)) {
        return {
            success: false,
            message: 'Wrong role selecting!',
        }
    }

    // Normalize email and check
    const email = normalizedEmail?.trim().toLowerCase();

    if (!email) {
        return {
            success: false,
            message: 'Email is required!'
        };
    }

    // generate otp
    const generateOtp = crypto.randomInt(100000, 1000000).toString();
    const hashOtp = await bcrypt.hash(generateOtp, 10);

    // generate verification_id 
    const verification_id_value = crypto.randomUUID();

    // delete old OTP from same email
    await registrationOtpModel.deleteMany(
        { email: email },
        session ? { session } : {}
    );

    // save otp in database
    const nowDate = new Date();
    const options = session ? { session } : {}

    // OTP data
    const otpData = {
        verification_id: verification_id_value,
        email: email,
        hash_otp: hashOtp,
        expiresAt: new Date(nowDate.getTime() + 5 * 60 * 1000), // expires in 5 min
        session_expiresAt: new Date(nowDate.getTime() + 30 * 60 * 1000), // session expires in 30 min
        role: role,
        hash_password: hashedPassword,
        profile_data: profile_data,
    }

    // otp creation
    let otpCreation;
    if(session){
        const result = await registrationOtpModel.create(
            [otpData],
            options
        );
        otpCreation = result[0]
    }
    else{
        otpCreation = await registrationOtpModel.create(
            otpData
        );
    }

    // mask email for sending otp
    const maskedEmail = maskEmail(email);

    try {
        // send otp via email
        await sendEmailOTP(email, profile_data.first_name, profile_data.last_name, generateOtp);

        // return data
        return {
            success: true,
            message: 'OTP send successfully...',
            verification_id: verification_id_value,
            masked_email: maskedEmail,
            expiresAt: otpCreation.expiresAt
        }
    }
    catch {
        await registrationOtpModel.findOneAndUpdate(
            { _id: otpCreation._id },
            {
                $set: {
                    expiresAt: new Date()
                }
            },
            { 
                new: true,
                ...options
            }
        );

        throw new Error('Error while sending OTP!')
    }
}

module.exports = OTPHelper;