import mongoose from "mongoose";

const CoinSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    ticker: {
        type: String,
        required: true
    },
    contractAddress: {
        type: String,
        default: ""
    },
    chainId: {
        type: String,
        required: true
    },
    decimal: {
        type: Number,
        required: true,
        default: 18
    },
    status: {
        type: Number, // 1:active, 0:inactive
        required: true,
        default: 1
    },
    createdOn: {
        type: Number,
        default: () => Math.floor(Date.now() / 1000)
    },
    updatedOn: {
        type: Number,
        default: () => Math.floor(Date.now() / 1000)
    },
})

CoinSchema.pre('save', function (next) {
    this.updatedOn = Math.floor(Date.now() / 1000);
    next();
});

const Coin = mongoose.models.Coin || mongoose.model("Coin", CoinSchema);

module.exports = Coin