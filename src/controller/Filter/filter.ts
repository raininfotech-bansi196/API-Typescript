const Chain = require("../../dbmodels/Chain");
const Coin = require("../../dbmodels/Coin");
const UserWebWallet = require("../../dbmodels/UserWebWallet");
const { passEnc, encryption_key, passDec } = require("../../utils/common");
const { check_user_login } = require("../../utils/backend");
const Withdrawal = require("../../dbmodels/Withdrawal");
const ChainList = async (req: any, res: any) => {
    try {
        let user = await check_user_login(req);
        if (!user.data.userId || !user.status) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const response = await Chain.find({}, { name: 1, _id: 1 }).lean();
        const data = response.map((item: any) => {
            return {
                label: item.name,
                value: passEnc(item?._id.toString(), encryption_key('chainId'))
            }
        })
        return res.status(200).json({ success: true, message: "success", data: data });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}
const CoinList = async (req: any, res: any) => {
    try {
        let user = await check_user_login(req);
        if (!user.data.userId || !user.status) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const { chain } = req.body;
        let filter = {};
        if (chain) {
            filter = { chainId: passDec(chain, encryption_key('chainId')) }
        }
        const response = await Coin.find(filter, { name: 1, _id: 1 }).lean();
        const data = response.map((item: any) => {
            return {
                label: item.name,
                value: passEnc(item?._id.toString(), encryption_key('coinId'))
            }
        })
        return res.status(200).json({ success: true, message: "success", data: data });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, message: "Internal Server Error" })
    }
}

const WalletListFilter = async (req: any, res: any) => {
    try {
        let user = await check_user_login(req);
        if (!user.data.userId || !user.status) {
            return res.status(400).json({ message: 'Unauthorized' });
        }

        const filter = { userId: user.data.userId };

        const chains = await UserWebWallet.aggregate([
            { $match: filter },
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
                $group: {
                    _id: "$chainDetails._id",
                    label: { $first: "$chainDetails.name" },
                    value: { $first: "$chainDetails._id" }
                }
            },
            { $project: { _id: 0, label: 1, value: 1 } }
        ]);

        const coins = await UserWebWallet.aggregate([
            { $match: filter },
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
                $group: {
                    _id: "$coinDetails._id",
                    label: { $first: "$coinDetails.name" },
                    value: { $first: "$coinDetails._id" }
                }
            },
            { $project: { _id: 0, label: 1, value: 1 } }
        ]);
        const chainData = chains.map((item: any) => {
            return {
                label: item.label,
                value: passEnc(item.value.toString(), encryption_key('chainId'))
            }
        })
        const coinData = coins.map((item: any) => {
            return {
                label: item.label,
                value: passEnc(item.value.toString(), encryption_key('coinId'))
            }
        })
        return res.status(200).json({ success: true, chains: chainData, coins: coinData });
    } catch (error) {
        console.error({ error });
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
const WithdrawalListFilter = async (req: any, res: any) => {
    try {
        let user = await check_user_login(req);
        if (!user.data.userId || !user.status) {
            return res.status(400).json({ message: 'Unauthorized' });
        }

        const filter = { userId: user.data.userId };

        const chains = await Withdrawal.aggregate([
            { $match: filter },
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
                $group: {
                    _id: "$chainDetails._id",
                    label: { $first: "$chainDetails.name" },
                    value: { $first: "$chainDetails._id" }
                }
            },
            { $project: { _id: 0, label: 1, value: 1 } }
        ]);

        const coins = await Withdrawal.aggregate([
            { $match: filter },
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
                $group: {
                    _id: "$coinDetails._id",
                    label: { $first: "$coinDetails.name" },
                    value: { $first: "$coinDetails._id" }
                }
            },
            { $project: { _id: 0, label: 1, value: 1 } }
        ]);
        
        const chainData = chains.map((item: any) => {
            return {
                label: item.label,
                value: passEnc(item.value.toString(), encryption_key('chainId'))
            }
        })
        const coinData = coins.map((item: any) => {
            return {
                label: item.label,
                value: passEnc(item.value.toString(), encryption_key('coinId'))
            }
        })
        return res.status(200).json({ success: true, chains: chainData, coins: coinData });
    } catch (error) {
        console.error({ error });
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
module.exports = { ChainList, CoinList, WalletListFilter, WithdrawalListFilter }