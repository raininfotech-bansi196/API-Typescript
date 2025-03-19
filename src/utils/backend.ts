import { encryption_key, passEnc } from "./common";

const fs = require('fs');
const jwt = require("jsonwebtoken");
const privateKey = fs.readFileSync(__dirname + '/pem/private.key');
const publicKey = fs.readFileSync(__dirname + '/pem/public.key');
const User = require("../dbmodels/User");
export const send_mail = async (email: string, otp: string, subject: string) => {
    const mailer = require('nodemailer');
    const ejs = require('ejs');
    const fs = require('fs');
    const template = fs.readFileSync('mail.html', { encoding: 'utf-8' })
    const transporter = mailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    })
    const mailData = {
        logo: process.env.FRONT_URL + 'img/logo.png',
        baseUrl: process.env.FRONT_URL,
        sitename: process.env.SITENAME,
        title: subject,
        otp: otp
    }
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        title: subject,
        subject: subject,
        html: ejs.render(template, mailData),
    }
    transporter.sendMail(mailOptions, function (error: any, info: any) {
        if (error) {
            console.log(error);
        } else {
        }
    });
}

export function encodeJwtWithPem(param: any) {
    try {
        return jwt.sign(param, privateKey, { algorithm: 'RS256' }, { expiresIn: '1d' });
    } catch (e) {
        return ''
    }
}

export function decodeJwtWithPem(token: string) {
    try {
        return jwt.verify(token, publicKey);
    } catch (edge) {
        return ''
    }
}
export const generateUniqueCode = async (): Promise<string> => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let code: any = "";
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        code += chars[randomIndex];
    }
    const chkCode = await User.find({}, { referral_code: 1 }).lean();
    if (chkCode.some((row: any) => row.referral_code === code)) {
        return generateUniqueCode();
    }
    return code;
};
export async function check_user_login(req: any) {
    try {
        let token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : ''
        let userdata = decodeJwtWithPem(token);
        if (userdata.email && userdata.password) {
            let getUserData = await User.findOne({ email: userdata.email, password: userdata.password }, { username: 1, email: 1 }).lean();
            if (getUserData) {
                return {
                    status: true, data: { ...getUserData, userId: userdata?.userId }
                }
            }
        }
    } catch (e) {
        console.log('check_user_login=>', e)
    }
    return { status: false, data: {} }
}