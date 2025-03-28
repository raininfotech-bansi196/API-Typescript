import mongoose from "mongoose";
import { check_user_login } from "../../utils/backend";
import { encryption_key, passDec, passEnc, validate_string, validateContractAddress, validatePositiveNumber } from "../../utils/common";
const Chain = require("../../dbmodels/Chain");
const Coin = require("../../dbmodels/Coin");
const UserWebWallet = require("../../dbmodels/UserWebWallet");
const Withdrawal = require("../../dbmodels/Withdrawal")
const AddWithdrawalRequest = async (req: any, res: any) => {
    try {
        let user = await check_user_login(req);
        if (!user.data.userId || !user.status) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const { coinId, chainId, amount, toAddress } = req.body;
        try {
            validate_string(coinId, "Coin", 1);
            validate_string(chainId, "Chain", 1);
            validate_string(amount, "Amount");
            validatePositiveNumber(amount, "Amount");
            validate_string(toAddress, "To Address");
            validateContractAddress(toAddress);
        } catch (error) {
            return res.status(400).json({ success: false, message: error })
        }
        const decCoinId = passDec(coinId, encryption_key("coinId"));
        const decChainId = passDec(chainId, encryption_key("chainId"));
        const existChain = await Chain.findOne({ _id: decChainId }, { _id: 1 });
        if (!existChain) {
            return res.status(400).json({ success: false, message: "Chain not found" });
        }

        const existCoin = await Coin.findOne({ _id: decCoinId }, { _id: 1 });
        if (!existCoin) {
            return res.status(400).json({ success: false, message: "Coin not found" });
        }

        const existUserWallet = await UserWebWallet.findOne({ userId: user.data.userId, coinId: decCoinId, chainId: decChainId }, { _id: 1, balance: 1, address: 1 });
        if (!existUserWallet) {
            return res.status(400).json({ success: false, message: "User wallet not found" });
        }

        if (Number(amount) > existUserWallet.balance) {
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        if (existUserWallet?.address === toAddress) {
            return res.status(400).json({ message: "You can't send to self address", success: false })
        }

        const existRequest = await Withdrawal.findOne({ userId: user.data.userId, coinId: decCoinId, chainId: decChainId, status: 0 });
        if (existRequest) {
            return res.status(400).json({ success: false, message: "Your last withdrawal is still pending, wait until it is completed" })
        }

        await Withdrawal.create({
            _id: new mongoose.Types.ObjectId(),
            userId: user?.data?.userId,
            coinId: decCoinId,
            chainId: decChainId,
            toAddress: toAddress,
            fromAddress: existUserWallet?.address,
            amount: amount
        })
        await UserWebWallet.findOneAndUpdate({
            chainId: decChainId,
            coinId: decCoinId,
            userId: user?.data?.userId
        }, {
            $inc: {
                balance: -amount
            }
        })
        return res.status(200).json({ success: true, message: "Withdrawal request has been successfully submitted" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

const GetWithdrawalRequest = async (req: any, res: any) => {
    try {
        let user = await check_user_login(req);
        if (!user.data.userId || !user.status) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        let { page = 1, limit = 10, orderColumn = 0, order = 0, chain, coin, address } = req.body;
        const orderBy = order === 0 ? -1 : 1;
        const pageNum = +page;
        const limitNum = +limit;

        const filter: Record<string, any> = { userId: user.data.userId };
        if (address && address !== '') {
            filter["$or"] = [
                { "toAddress": { $regex: address, $options: "i" } },
                { "fromAddress": { $regex: address, $options: "i" } }
            ];
        }
        if (chain && chain !== '') {
            filter["chainId"] = passDec(chain, encryption_key('chainId'));
        }
        if (coin && coin !== '') {
            filter["coinId"] = passDec(coin, encryption_key('coinId'));
        }

        const matchStage = { $match: filter };

        const sortArray = ["createdOn", "chainName", "coinName", "amount", "toAddress", "fromAddress", "createdOn"];

        const totalRecords = await Withdrawal.countDocuments(filter);
        const totalPages = Math.ceil(totalRecords / limitNum);

        const data = await Withdrawal.aggregate([
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
                    amount: 1,
                    status: 1,
                    fromAddress: 1,
                    toAddress: 1,
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
            _id: passEnc(x?._id.toString(), encryption_key("withdrawalId"))
        }));

        return res.status(200).json({ success: true, data: result, totalPages, totalRecords });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

module.exports = { AddWithdrawalRequest, GetWithdrawalRequest }