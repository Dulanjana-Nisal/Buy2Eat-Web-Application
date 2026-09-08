const mongoose = require('mongoose');

const resetPasswordModel = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: [true, 'user_id is required!']
    },
    resetPasswordToken: {
        type: String,
        required: [true, 'Reset token is required!']
    },
    createdAt: {
        type: Date,
        required: [true, 'createdAt is required!'],
    },
    expiredAt: {
        type: Date,
        required: [true, 'expiredAt is required!'],
        expires: 0
    }
})

module.exports = mongoose.model('ResetPassword', resetPasswordModel)