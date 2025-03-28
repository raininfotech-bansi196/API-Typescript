import express from 'express';
const router = express.Router();
const Wallet = require("../controller/Wallet/wallet");

router.post("/generate-user-wallet", Wallet.generateUserWallet);
router.post("/user-wallet-list", Wallet.getUserWalletList);

module.exports = router;
