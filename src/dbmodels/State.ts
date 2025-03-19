import mongoose from "mongoose";

const StateSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    contryId: {
        type: Number,
        required: true
    },
    stateName: {
        type: String
    },
    createdOn: {
        type: Number,
    }
})

const State = mongoose.models.State || mongoose.model("State", StateSchema);

module.exports = State
