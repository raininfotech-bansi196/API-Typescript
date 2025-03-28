import mongoose from "mongoose";

const UserWebWalletSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    clientWebId: {
        type: String,
        default: ''
    },
    chainId: {
        type: String,
        required: true
    },
    coinId: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    address:{
        type: String,
        default: ''
    },
    key:{
        type: String,
        default: ''
    },
    createdOn: {
        type: Number,
        default: () => Math.floor(Date.now() / 1000)
    },
    updatedOn: {
        type: Number,
        default: () => Math.floor(Date.now() / 1000)
    }
})

UserWebWalletSchema.pre('save', function (next) {
    this.updatedOn = Math.floor(Date.now() / 1000);
    next();
});

const UserWebWallet = mongoose.models.UserWebWallet || mongoose.model("UserWebWallet", UserWebWalletSchema);

module.exports = UserWebWallet
