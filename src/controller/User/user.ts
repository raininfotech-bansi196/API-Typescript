import mongoose from "mongoose";
import { check_user_login } from "../../utils/backend";
import { encryption_key, passEnc } from "../../utils/common";
const User = require("../../dbmodels/User");
const Country = require('../../dbmodels/Country');
const State = require('../../dbmodels/State');
const UserDetails = async (req: any, res: any) => {
    try {
        let user = await check_user_login(req);
        if (!user.data.userId || !user.status) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const result = await User.findOne({ email: user.data.email }, { email: 1, isTwoFAEnabled: 1, username: 1, password: 1, isVerified: 1, phoneNumber: 1, referral_code: 1, country: 1, state: 1, address: 1, city: 1, pincode: 1 }).lean();
        if (!result) {
            return res.status(400).json({ success: false, message: "Unauthorized" });
        }
        return res.status(200).json({ success: true, message: "success", data: { ...result, _id: passEnc(result._id, encryption_key("userId")) } });
    } catch (error) {
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

const EditProfile = async (req: any, res: any) => {
    try {
        let user = await check_user_login(req);
        if (!user.data.userId || !user.status) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const { username, phoneNumber, address, country, state, city, pincode } = await req.body;
        await User.updateOne({ email: user.data.email }, { username, phoneNumber, address, country, state, city, pincode }, { upsert: true });
        return res.status(200).json({ success: true, message: "Profile has been updated successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

const getCountryData = async (req: any, res: any) => {
    try {
        let user = await check_user_login(req);
        if (!user.data.userId || !user.status) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const result = await Country.find({}, { contryId: 1, countryName: 1, countryCode: 1 }).lean();
        return res.status(200).json({ success: true, message: "success", data: result });
    } catch (error) {
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

const getStateData = async (req: any, res: any) => {
    try {
        let user = await check_user_login(req);
        if (!user.data.userId || !user.status) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const { country } = await req.body;
        console.log({ country });

        const contryId = await Country.findOne({ countryName: country }, { contryId: 1 });
        console.log({ contryId });

        const result = await State.find({ contryId: contryId?.contryId }, { stateName: 1 }).lean();
        console.log({ result });

        return res.status(200).json({ success: true, message: "success", data: result });
    } catch (error) {
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

module.exports = { UserDetails, getCountryData, getStateData, EditProfile }