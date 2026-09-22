const mongoose = require('mongoose');

const googleRegisterModel = mongoose.Schema({
    google_id: {
        type: String,
        required: [true, 'google_id is required!'],
    },
    email: {
        type: String,
        required: [true, 'Email is required!'],
        lowercase: true,
        trim: true,
    },
    first_name: {
        type: String,
        required: [true, 'First Name is required!'],
        minlength: [2, 'First name must be more than 2 letters']
    },
    last_name: {
        type: String,
        required: [true, 'Last Name is required!'],
        minlength: [2, 'Last name must be more than 2 letters']
    },
    profile_image: {
        type: String,
    },
    registration_token: {
        type: String,
        required: [true, 'registration_token is required!']
    },
    expiresAt: {
        type: Date,
        required: [true, 'Date is required!']
    }
}, { timestamps: true });

module.exports = mongoose.model("GoogleRegister", googleRegisterModel)