import mongoose from "mongoose";

const CountrySchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    contryId: {
        type: Number,
        required: true
    },
    countryName: {
        type: String
    },
    countryCode: {
        type: String
    },
    createdOn: {
        type: Number,
    }
})

const Country = mongoose.models.Country || mongoose.model("Country", CountrySchema);

module.exports = Country
