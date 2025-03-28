import express from 'express';
const router = express.Router();
const Filter = require("../controller/Filter/filter");

router.get("/filter/chain-list", Filter.ChainList);
router.post("/filter/coin-list", Filter.CoinList);
router.get("/filter/wallet-list-filter", Filter.WalletListFilter);
router.get("/filter/withdrawal-list-filter", Filter.WithdrawalListFilter);
module.exports = router;
