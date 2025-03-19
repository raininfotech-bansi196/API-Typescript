
import express from 'express';
const router = express.Router();
const Auth = require("../controller/Auth/auth");

router.post("/login", Auth.Login);
router.post("/register", Auth.Register);
router.post("/forgot-password", Auth.ForgotPassword);
router.post("/reset-password", Auth.ResetPassword);
router.post("/resend-otp", Auth.ResendOTP);
router.post("/verify-account", Auth.VerifyAccount);
router.post('/change-password', Auth.ChangePassword);
router.post('/generate-twofa', Auth.GenerateTwoFa);
router.post('/verify-twofa', Auth.VerifyTwoFa);

module.exports = router;
