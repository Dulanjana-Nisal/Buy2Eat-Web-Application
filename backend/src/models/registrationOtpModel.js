const mongoose = require('mongoose');

// registration OTP model schema
const registrationOtpModel = mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required!'],
        trim: true,
        lowercase: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please enter a valid email address"
        ]
    },
    expiresAt: {
        type: Date,
        required: [true, 'expiresAt is required!']
    },
    attempts: {
        type: Number,
        default: 5,
        maxlength: [5, 'Attempts number should be less than 5']
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
})

module.exports = mongoose.model('RegistrationOtp', registrationOtpModel)