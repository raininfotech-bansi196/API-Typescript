import { ethers } from "ethers";
import mongoose from "mongoose";
import { TronWeb } from "tronweb";
import { check_user_login } from "../../utils/backend";
import { encryption_key, passDec, passEnc } from "../../utils/common";
const User = require("../../dbmodels/User");
const Chain = require('../../dbmodels/Chain');
const Coin = require('../../dbmodels/Coin');
const UserWebWallet = require('../../dbmodels/UserWebWallet');
const generateUserWallet = async (req: any, res: any) => {
    try {
        let user = await check_user_login(req);
        if (!user.data.userId || !user.status) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const { chainId, coinId } = await req.body;
        const decChainId = passDec(chainId, encryption_key('chainId'));
        const decCoinId = passDec(coinId, encryption_key('coinId'));
        if (!decChainId || !decCoinId) {
            return res.status(400).json({ success: false, message: "Unauthorized" });
        }
        const existUser = await User.findOne({ _id: user.data.userId }, { _id: 1, isVerified: 1, status: 1 });
        if (!existUser) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        if (existUser?.isVerified !== 1) {
            return res.status(400).json({ success: false, message: "User not verified" });
        }
        if (existUser?.status !== 1) {
            return res.status(400).json({ success: false, message: "User dectivated by admin" });
        }
        const existChain = await Chain.findOne({ _id: decChainId }, { _id: 1, name: 1 });
        if (!existChain) {
            return res.status(400).json({ success: false, message: "Chain not found" });
        }
        const existCoin = await Coin.findOne({ _id: decCoinId, chainId: decChainId }, { _id: 1 });
        if (!existCoin) {
            return res.status(400).json({ success: false, message: "Coin not found" });
        }
        const checkWallet = await UserWebWallet.findOne({ userId: user.data.userId, chainId: decChainId, coinId: decCoinId }, { _id: 1, address: 1 });
        if (checkWallet) {
            return res.status(200).json({ success: true, message: "Wallet already exist", address: checkWallet?.address });
        }
        let walletAddress = "";
        let privateKey = "";
        let publicKey: string = "";
        if (existChain?.name.includes("Tron") || existChain?.name.includes("tron")) {
            const tronWeb = new TronWeb({
                fullHost: "https://api.shasta.trongrid.io", // Use Testnet (Shasta) or Mainnet URL
            });

            const account = await tronWeb.createAccount();
            console.log({ account });

            walletAddress = account.address.base58 || "";
            privateKey = account.privateKey || "";
        } else {
            const wallet = ethers.Wallet.createRandom();
            console.log({ wallet });
            walletAddress = wallet.address;
            privateKey = wallet.privateKey;
            publicKey = wallet.publicKey;
        }
        console.log({ walletAddress });
        console.log({ privateKey });

        await UserWebWallet.create({
            userId: user.data.userId,
            chainId: decChainId,
            coinId: decCoinId,
            address: walletAddress,
            key: passEnc(privateKey, encryption_key('privateKey')),
            _id: new mongoose.Types.ObjectId()
        });
        return res.status(200).json({ success: true, message: "Wallet has been created successfully", walletAddress: walletAddress || "" });
    } catch (error) {
        console.log({ error });
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

const getUserWalletList = async (req: any, res: any) => {
    try {
        let user = await check_user_login(req);
        if (!user.data.userId || !user.status) {
            return res.status(400).json({ message: 'Unauthorized' });
        }

        let { page = 1, limit = 10, orderColumn = 0, order = 0, chain, coin, address } = req.body;
        const orderBy = order === 0 ? -1 : 1;
        const pageNum = +page;
        const limitNum = +limit;

        const filter: Record<string, any> = { userId: user.data.userId };
        if (address && address !== '') {
            filter["address"] = { $regex: address, $options: "i" };
        }
        if (chain && chain !== '') {
            filter["chainId"] = passDec(chain, encryption_key('chainId'));
        }
        if (coin && coin !== '') {
            filter["coinId"] = passDec(coin, encryption_key('coinId'));
        }

        const matchStage = { $match: filter };

        const sortArray = ["createdOn", "chainName", "coinName", "balance", "address", "createdOn"];

        const totalRecords = await UserWebWallet.countDocuments(filter);
        const totalPages = Math.ceil(totalRecords / limitNum);

        const data = await UserWebWallet.aggregate([
            matchStage,
            {
                $lookup: {
                    from: 'chains',
                    localField: 'chainId',
                    foreignField: '_id',
                    as: 'chainDetails'
                }
            },
            { $unwind: "$chainDetails" },
            {
                $lookup: {
                    from: 'coins',
                    localField: 'coinId',
                    foreignField: '_id',
                    as: 'coinDetails'
                }
            },
            { $unwind: "$coinDetails" },
            {
                $project: {
                    _id: 1,
                    chainName: "$chainDetails.name",
                    coinName: "$coinDetails.name",
                    balance: 1,
                    address: 1,
                    createdOn: 1
                }
            },
            { $sort: { [sortArray[Number(orderColumn)]]: orderBy } },
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum }
        ]);

        let ascNum = Number(Number(page) - 1) * Number(limit);
        let descNum = totalRecords - Number(Number(page) - 1) * Number(limit);

        const result = data?.map((x: any) => ({
            ...x,
            num: order === 0 ? ++ascNum : descNum--,
            _id: passEnc(x?._id.toString(), encryption_key("userWebWalletId"))
        }));

        return res.status(200).json({ success: true, data: result, totalPages, totalRecords });
    } catch (error) {
        console.error({ error });
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = { generateUserWallet, getUserWalletList }