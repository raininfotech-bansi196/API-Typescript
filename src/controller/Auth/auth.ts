import mongoose from "mongoose";
import { check_user_login, decodeJwtWithPem, encodeJwtWithPem, generateUniqueCode, send_mail } from "../../utils/backend";
import { chk_confirm_password, chk_email, chk_otp, chk_OTP, chk_password, chk_username, encryption_key, generateNumeric, get_timestemp, passDec, passEnc, validate_string } from "../../utils/common";
const User = require("../../dbmodels/User");
const Login = async (req: any, res: any) => {
    try {
        const { email, password }: { email: string; password: string } = await req.body;
        try {
            validate_string(email, "Email");
            validate_string(password, "Password");
            chk_email(email);
            chk_password(password);
        } catch (error) {
            return res.status(400).json({ success: false, message: error })
        }
        const user = await User.findOne({ email }, { isTwoFAEnabled: 1, password: 1, isVerified: 1 });
        if (user && passDec(user.password, encryption_key('passwordKey')) === password) {
            const token = encodeJwtWithPem({ email: email });
            if (user?.isVerified === 0) {
                let curTime = get_timestemp();
                let otpCode = generateNumeric(6);
                let expTime = parseInt(curTime.toString()) + 600;
                await send_mail(email, otpCode, "Verify Your Account");
                await user.updateOne({ otpCode: passEnc(otpCode, encryption_key("otpKey")), otpExpireTime: expTime }, { upsert: true });
                return res.status(200).json({ success: true, token: token, isVerified: 0 })
            } else if (user?.isTwoFAEnabled === 1) {
                return res.status(200).json({ success: true, token: token, isTwoFAEnabled: 1 })
            } else {
                const accessToken = encodeJwtWithPem({ email: email, password: user?.password, isTwoFAEnabled: user?.isTwoFAEnabled, isVerified: user?.isVerified, userId: passEnc(user?._id, encryption_key("userId")) });
                return res.status(200).json({ success: true, message: "Login successfully", accessToken: accessToken })
            }
        } else {
            return res.status(400).json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

const Register = async (req: any, res: any) => {
    try {
        const { email, password, name, confirmPassword, uplineCode }: { email: string; password: string; name: string, role: string, confirmPassword: string, uplineCode: string } = await req.body;
        try {
            validate_string(email, "Email");
            chk_email(email);
            validate_string(name, "Name");
            chk_username(name);
            validate_string(password, "Password");
            chk_password(password);
            validate_string(confirmPassword, "Confirm Password");
            chk_confirm_password(password, confirmPassword, "Password and confirm password must be same")
        } catch (error) {
            return res.status(400).json({ success: false, message: error })
        }
        const admin = await User.findOne({ email });
        if (admin) {
            return res.status(400).json({ success: false, message: "Email already exists" })
        }
        const refferalCode = await generateUniqueCode();
        let uplineString: string = ""
        if (uplineCode) {
            const isExist = await User.findOne({ referral_code: uplineCode }, { _id: 1, uplineString: 1 });
            if (isExist) {
                const uplineUserId = isExist._id;
                const existingUplineString = isExist.uplineString;
                if (existingUplineString) {
                    uplineString = `${existingUplineString}${uplineUserId}~`;
                } else {
                    uplineString = `~${uplineUserId}~`;
                }
            } else {
                return res.status(400).json({ success: false, message: "Invalid Refferal Code" })
            }
        }
        const newAdmin = new User({
            _id: new mongoose.Types.ObjectId(),
            email,
            password: passEnc(password, encryption_key('passwordKey')),
            username: name,
            country: "India",
            referral_code: refferalCode,
            uplineString: uplineString
        });
        await newAdmin.save();
        return res.status(200).json({ success: true, message: "User registered successfully" })
    } catch (error) {
        console.log("🚀 ~ Register ~ error:", error)

        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

const ForgotPassword = async (req: any, res: any) => {
    try {
        const { email }: { email: string } = await req.body;
        try {
            validate_string(email, "Email");
            chk_email(email);
        } catch (error) {
            return res.status(400).json({ success: false, message: error })
        }
        const user = await User.findOne({ email }, { email: 1 });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" })
        }
        let curTime = get_timestemp();
        let otpCode = generateNumeric(6);
        let expTime = parseInt(curTime.toString()) + 600;
        await send_mail(email, otpCode, "Reset Your Password");
        const accessTokenMail = encodeJwtWithPem({ email: email });
        await user.updateOne({ otpCode: passEnc(otpCode, encryption_key("otpKey")), otpExpireTime: expTime }, { upsert: true });
        return res.status(200).json({ success: true, token: accessTokenMail, message: "Mail send successfully" })
    } catch (error) {
        console.log(error, "ForgotPassword");
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

const ResetPassword = async (req: any, res: any) => {
    try {
        const { token, password, confirmPassword, otp }: { token: string, password: string; confirmPassword: string, otp: string } = await req.body;
        try {
            validate_string(password, "Password");
            chk_password(password);
            validate_string(confirmPassword, "Confirm Password");
            chk_confirm_password(password, confirmPassword, "Password and confirm password must be same");
            validate_string(otp, "OTP");
            chk_OTP(otp);
        } catch (error) {
            return res.status(400).json({ success: false, message: error })
        }
        const data = decodeJwtWithPem(token);
        if (!data?.email) {
            return res.status(400).json({ success: false, message: "Invalid Token" })
        }
        const user = await User.findOne({ email: data?.email }, { email: 1, otpCode: 1, otpExpireTime: 1 });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" })
        }
        if (passDec(user.otpCode, encryption_key("otpKey")) !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" })
        }
        if (user.otpExpireTime < get_timestemp()) {
            return res.status(400).json({ success: false, message: "OTP Expired" })
        }
        await user.updateOne({ password: passEnc(password, encryption_key('passwordKey')), otpCode: null, otpExpireTime: null }, { upsert: true });
        return res.status(200).json({ success: true, message: "Password has been reset successfully" })
    } catch (error) {
        console.log(error, "ResetPassword");
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

const ResendOTP = async (req: any, res: any) => {
    try {
        const { token }: { token: string } = await req.body;
        const data = decodeJwtWithPem(token);
        if (!data?.email) {
            return res.status(400).json({ success: false, message: "Invalid Token" })
        }
        const email = data?.email;
        const user = await User.findOne({ email }, { email: 1, otpCode: 1, otpExpireTime: 1 });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" })
        }
        let curTime = get_timestemp();
        let otpCode, expTime;
        if (user.otpExpireTime && curTime < user.otpExpireTime) {
            otpCode = user.otpCode;
            expTime = user.otpExpireTime;
        } else {
            otpCode = generateNumeric(6);
            expTime = parseInt(curTime.toString()) + 600;
            await user.updateOne({ otpCode: passEnc(otpCode, encryption_key("otpKey")), otpExpireTime: expTime }, { upsert: true });
        }
        await send_mail(email, otpCode, "Reset Your Password");
        return res.status(200).json({ success: true, message: "Mail send successfully" })
    } catch (error) {
        console.log(error, "ResendOTP");
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

const VerifyAccount = async (req: any, res: any) => {
    try {
        const { token, otp }: { token: string, otp: string } = await req.body;
        try {
            validate_string(otp, "OTP");
            chk_OTP(otp);
        } catch (error) {
            return res.status(400).json({ success: false, message: error })
        }
        const data = decodeJwtWithPem(token);
        if (!data?.email) {
            return res.status(400).json({ success: false, message: "Invalid Token" })
        }
        const user = await User.findOne({ email: data?.email }, { email: 1, otpCode: 1, otpExpireTime: 1 });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" })
        }
        if (passDec(user.otpCode, encryption_key("otpKey")) !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" })
        }
        if (user.otpExpireTime < get_timestemp()) {
            return res.status(400).json({ success: false, message: "OTP Expired" })
        }
        await user.updateOne({ isVerified: true }, { upsert: true });
        return res.status(200).json({ success: true, message: "Account has been verified successfully" })
    } catch (error) {
        console.log(error, "VerifyAccount");
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

const ChangePassword = async (req: any, res: any) => {
    try {
        const { token, newPassword, confirmPassword, oldPassword }: { token: string, newPassword: string; confirmPassword: string, oldPassword: string } = await req.body;
        try {
            validate_string(oldPassword, "Old Password");
            chk_password(oldPassword);
            validate_string(newPassword, "New Password");
            chk_password(newPassword);
            validate_string(confirmPassword, "Confirm Password");
            chk_confirm_password(newPassword, confirmPassword, "Password and confirm password must be same");
        } catch (error) {
            return res.status(400).json({ success: false, message: error })
        }
        const data = decodeJwtWithPem(token);
        if (!data?.email) {
            return res.status(400).json({ success: false, message: "Invalid Token" })
        }
        const user = await User.findOne({ email: data?.email }, { email: 1, password: 1 });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" })
        }
        if (passDec(user.password, encryption_key("passwordKey")) !== oldPassword) {
            return res.status(400).json({ success: false, message: "Invalid Old Password" })
        }
        await user.updateOne({ password: passEnc(newPassword, encryption_key("passwordKey")) }, { upsert: true });
        return res.status(200).json({ success: true, message: "Password has been changed successfully" })
    } catch (error) {
        console.log(error, "ChangePassword");
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

const GenerateTwoFa = async (req: any, res: any) => {
    try {
        let usercheck = await check_user_login(req);
        if (!usercheck.data.userId || !usercheck.status) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const user = await User.findOne({ email: usercheck?.data?.email }, { isVerified: 1, isTwoFAEnabled: 1 });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" })
        }
        if (!user.isVerified) {
            return res.status(400).json({ success: false, message: "User not verified" })
        }
        if (user.isTwoFAEnabled) {
            return res.status(400).json({ success: false, message: "Two Factor Authentication already enabled" })
        }
        const speakeasy = require('speakeasy');
        const qr = require('qrcode');
        let twoFaname = process.env.SITENAME + " (" + usercheck?.data?.email + ")";
        const secret = speakeasy.generateSecret({ name: twoFaname });
        let secretKey = secret.base32
        let qrcode = await qr.toDataURL(secret.otpauth_url);
        return res.status(200).json({ success: true, message: "Two Factor Authentication has been enabled successfully", secretKey, qrcode })
    } catch (error) {
        console.log(error, "GenerateTwoFa");
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

const VerifyTwoFa = async (req: any, res: any) => {
    try {
        let usercheck = await check_user_login(req);
        if (!usercheck.data.userId || !usercheck.status) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const { otp, disable, secret }: { otp: string, disable: number, secret: string } = await req.body;
        try {
            chk_otp(otp);
        } catch (error) {
            return res.status(400).json({ success: false, message: error })
        }
        const user = await User.findOne({ email: usercheck?.data?.email }, { twoFASecret: 1, isTwoFAEnabled: 1 });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" })
        }
        const speakeasy = require('speakeasy');
        const verify = speakeasy.totp.verify({
            secret: secret ? passDec(secret, encryption_key('twofaKey')) : passDec(user?.twoFASecret, encryption_key('twofaKey')),
            encoding: "base32",
            token: otp,
        });
        if (!verify) {
            return res.status(400).json({ success: false, message: "Invalid Two Factor Authentication Code" })
        } else {
            if (user?.isTwoFAEnabled === 1 && user?.twoFASecret) {
                if (disable === 1) {
                    await user.updateOne({ isTwoFAEnabled: 0, twoFASecret: null }, { upsert: true });
                }
            } else {
                await user.updateOne({ isTwoFAEnabled: 1, twoFASecret: secret || null }, { upsert: true });
            }
            return res.status(200).json({ success: true, message: "success" })
        }
    } catch (error) {
        console.log(error, "verifyTwoFa");
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

module.exports = { Login, Register, ForgotPassword, ResetPassword, ResendOTP, VerifyAccount, ChangePassword, GenerateTwoFa, VerifyTwoFa }