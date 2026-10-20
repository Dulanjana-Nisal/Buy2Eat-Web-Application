const mongoose = require('mongoose');

const RefreshTokenModel = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: [true, 'user_id is required!']
    },
    familyId: {
        type: String,
        required: [true, 'familyId is required!']
    },
    hashToken: {
        type: String,
        required: [true, 'hashToken is required!']
    },
    deviceInfo: {
        userAgent: {
            type: String
        },
        ipAddress: {
            type: String
        }
    },
    isRevoked: {
        type: Boolean,
        default: false
    },
    rememberMe: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: [true, 'expiresAt is required!'],
        expires: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('RefreshToken', RefreshTokenModel);
