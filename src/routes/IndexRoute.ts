
const router = require("express").Router();
const AuthRoute = require('./AuthRoutes');
const UserRoute = require('./UserRoutes');
const WalletRoute = require('./WalletRoutes');
const FilterRoute = require('./FilterRoutes');
const WithdrawalRoute = require('./WithdrawalRoutes');

router.use(AuthRoute);
router.use(UserRoute);
router.use(WalletRoute);
router.use(FilterRoute);
router.use(WithdrawalRoute);

module.exports = router;