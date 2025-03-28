import mongoose from "mongoose";

const ChainSchema = new mongoose.Schema({
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
    decimal: {
        type: Number,
        required: true,
        default: 18
    },
    rpcUrl: {
        type: String, // RPC for blockchain interaction
        required: true
    },
    explorerUrl: {
        type: String, // For transaction tracking
        required: true
    },
    status: {
        type: Number, // 1:active,0:inactive
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

ChainSchema.pre('save', function (next) {
    this.updatedOn = Math.floor(Date.now() / 1000);
    next();
});

const Chain = mongoose.models.Chain || mongoose.model("Chain", ChainSchema);

module.exports = Chain;
