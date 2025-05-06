import express from 'express';
const router = express.Router();
const User = require("../controller/User/user");

router.get("/user-details", User.UserDetails);
router.get("/get-country-data", User.getCountryData);
router.post("/get-state-data", User.getStateData);
router.post("/update-profile", User.EditProfile);
router.get("/get-maintenance", User.getMaintenanceMode);
module.exports = router;
