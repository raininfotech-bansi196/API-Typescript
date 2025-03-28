import express from 'express';
const router = express.Router();
const Withdrawal = require("../controller/Withdrawal/withdrawal");

router.post("/add-withdrawal-request", Withdrawal.AddWithdrawalRequest);
router.post("/get-withdrawal-request", Withdrawal.GetWithdrawalRequest);

module.exports = router;
