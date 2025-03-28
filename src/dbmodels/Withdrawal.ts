import mongoose from "mongoose";

const WithdrawalSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    chainId: { type: String, required: true },
    coinId: { type: String, required: true },
    amount: { type: Number, required: true },
    fromAddress: { type: String, required: true },
    toAddress: { type: String, required: true },
    hash: { type: String, default: '' },
    status: { type: Number, default: 0 }, // 0: pending, 1: confirmed, 2: rejected
    createdOn: {
        type: Number,
        default: () => Math.floor(Date.now() / 1000)
    },
    updatedOn: {
        type: Number,
        default: () => Math.floor(Date.now() / 1000)
    },
});

WithdrawalSchema.pre('save', function (next) {
    this.updatedOn = Math.floor(Date.now() / 1000);
    next();
});

const Withdrawal = mongoose.models.Withdrawal || mongoose.model("Withdrawal", WithdrawalSchema);

module.exports = Withdrawal
