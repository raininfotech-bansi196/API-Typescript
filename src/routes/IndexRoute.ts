
const router = require("express").Router();
const AuthRoute = require('./AuthRoutes');
const UserRoute = require('./UserRoutes');

router.use(AuthRoute);
router.use(UserRoute);

module.exports = router;