import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    country: {
        type: String,
        default: null
    },
    state: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    pincode: {
        type: String,
        default: null
    },
    twoFASecret: {
        type: String,
        default: null
    },
    isTwoFAEnabled: {
        type: Number,
        default: 0,
        enum: [0, 1] // 0 = false, 1 = true
    },
    isVerified: {
        type: Number,
        default: 0,
        enum: [0, 1] // 0 = false, 1 = true
    },
    status: {
        type: Number,
        default: 1,
        enum: [0, 1] // 0 = inactive, 1 = active
    },
    otpCode: {
        type: String,
        default: null
    },
    otpExpireTime: {
        type: Number,
        default: null
    },
    referral_code: {
        type: String,
        default: null
    },
    uplineString: {
        type: String,
        default: null
    },
    createdOn: {
        type: Number,
        default: () => Math.floor(Date.now() / 1000)
    },
    updatedOn: {
        type: Number,
        default: () => Math.floor(Date.now() / 1000)
    }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User