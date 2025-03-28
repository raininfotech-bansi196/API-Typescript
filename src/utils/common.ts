import moment from "moment";
import crypto from "crypto";
export function validate_string(data: string, prefix: string, type = 0) {
    if (!data || data.trim() == "") {
        let pre = type == 0 ? 'Enter ' : ' Select '
        throw pre + prefix;
    } else if (typeof data !== "string") {
        throw prefix + " is not valid";
    }
}
export function chk_username(a: string) {
    if (!(/^[a-zA-Z0-9]{5,15}$/.test(a))) {
        throw "Invalid Username"
    }
}
export function chk_email(str: string) {
    if (!(/^[a-z_0-9]+(\.[a-z0-9]+)*@[a-z0-9]+(\.[a-z0-9]+)*(\.[a-z]{2,3})$/.test(str))) {
        throw "Invalid Email";
    }
}

export function chk_URL(str: string, prefix: string) {
    const urlRegex = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
    if (!str) {
        throw `Enter ${prefix}`
    } else if (!urlRegex.test(str)) {
        throw "Invalid " + prefix;
    }

    return true;
}

export function chk_password(str: string) {
    if (!(/^\S*(?=\S{8,30})(?=\S*[a-z])(?=\S*[A-Z])(?=\S*[\d])(?=\S*[!\\/\\\\\"#$%&'()*+,-.\\:;<=>?@[\]^_`{|}~])\S*$/.test(str))) {
        throw "Invalid Password"
    }
}

export function chk_OTP(str: string) {
    if (!/^[0-9]{6}$/.test(str)) {
        throw "Enter valid 6 digits OTP"
    }
}

export function convert_date(date: number) {
    return moment(date * 1000).format("DD, MMM YYYY hh:mm A");
}

export function convert_date_only(date: number) {
    return moment(date * 1000).format("DD, MMM YYYY");
}

export function convert_gmt_date_only(date: number) {
    return moment.utc(new Date(date * 1000)).format("DD, MMM YYYY");
}

export function convert_gmt_time(date: number) {
    return moment.utc(new Date(date * 1000)).format("DD, MMM YYYY hh:mm A");
}

export function getGMTtime() {
    const localDate = new Date();
    const offsetMinutes = localDate.getTimezoneOffset();
    const gmtDate = new Date(localDate.getTime() - offsetMinutes * 60000);
    const gmtTimestamp = Math.floor(gmtDate.getTime() / 1000);
    return gmtTimestamp;
}

export function passDec(encryptedMessage: string, secret: any) {
    const iv = secret.substr(0, 16);
    const decryptor = crypto.createDecipheriv("aes-256-ctr", secret, iv);
    return decryptor.update(encryptedMessage, "base64", "utf8") + decryptor.final("utf8");
}


export function passEnc(textToEncrypt: string, secret: any) {
    const iv = secret.substr(0, 16);
    const encryptor = crypto.createCipheriv("aes-256-ctr", secret, iv);
    return encryptor.update(textToEncrypt, "utf8", "base64") + encryptor.final("base64");
}

export function get_timestemp() {
    return Math.floor(new Date().getTime() / 1000)
}
export function to_float(value: number, precision = 8) {
    return parseFloat(parseFloat(value.toString()).toFixed(precision))
}
interface Data {
    ids: string;
    mnemonic: string;
    passwordKey: string;
    twofaKey: string;
    otpKey: string;
    userId: string;
    chainId: string;
    coinId: string;
    privateKey: string;
    userWebWalletId: string;
    withdrawalId: string;
}
export function encryption_key(type: keyof Data): string {
    const data: Data = {
        ids: "d8sDuFrtSIWDS23fSDEtaG6BjHfjtcmG",
        mnemonic: "n90Ayh2IMP9PqhVSAf2A2uEAHeX0rZdM",
        passwordKey: "Ka8muhoHgUhB^G5eR8qq3vgI54^Mccsn",
        twofaKey: "HNdYduYLzoHB3AT3A6NvZf9DRTq9wQXu",
        otpKey: "4AwBR5qNvejh3j5JPCKdqdChkuuHnutF",
        userId: "d8sDuFrtSIWDS23fSDEtaG6BjHfjtcmG",
        chainId: "HgUhB^G5eRG6BjHfn90Ayh2I4AwBR2IM",
        coinId: "d8sDuFGWDS23BjHfn90AyHeX0rZdR8qq",
        privateKey: "fN4pU6nGLR6FyTaNwG4d6tXZirnQGkx4",
        userWebWalletId: "8sDuyh2IMG6BjHfHnutFAyh2Ih3j5JG4",
        withdrawalId: "HNdYdNvejhTaNwG4nutFAyhBR2IM6Bj6"
    }
    return data[type]
}

export function chk_otp(str: string) {
    if (!str) {
        throw "Enter google authenticator OTP"
    } else if (!/^[0-9]{6}$/.test(str)) {
        throw "Enter valid 6 digits google authenticator OTP"
    }
}


export function chk_confirm_password(pwd: string, cpwd: string, errorMsg: string) {
    if (pwd !== cpwd) {
        throw errorMsg
    }
}

export function generateNumeric(a = 6) {
    const g = "5468791302";
    let r = "";
    for (let i = 0; i < a; i++) {
        r += g.charAt(Math.floor(Math.random() * g.length));
    }
    return r;
}

export const validatePositiveNumber = (num: string, prefix: string) => {
    const numberRegex = /^[1-9]\d*$/;
    if (num === "0") {
        throw prefix + " should be greater than 0"
    } else if (!numberRegex.test(num)) {
        throw "Invalid " + prefix
    }
};
export const validateContractAddress = (address: string) => {
    // const contractRegex = /^0x[a-fA-F0-9]{40}$/;
    // if (!contractRegex.test(address)) {
    //     throw "Invalid Contract Address"
    // }
    const patterns = {
        ethereum: /^0x[a-fA-F0-9]{40}$/,  // Ethereum, BSC, Polygon (EVM-based)
        bitcoin: /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,42}$/,  // Bitcoin (Legacy, SegWit)
        solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,  // Solana (Base58)
        tron: /^T[a-zA-Z0-9]{33}$/,  // Tron (Starts with 'T', 34 chars)
        ripple: /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/  // XRP (Starts with 'r', 25-35 chars)
    };

    for (const [blockchain, regex] of Object.entries(patterns)) {
        if (regex.test(address)) {
            return { valid: true, blockchain };
        }
    }
    throw "Invalid Contract Address"
};

