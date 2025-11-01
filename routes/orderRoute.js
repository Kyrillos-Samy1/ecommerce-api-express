const express = require("express");
const { createCashOrder } = require("../services/orderServices");
const { allowRoles, protectRoutes } = require("../services/authServices");

const router = express.Router();

router.use(protectRoutes, allowRoles("user"));

router.post("/cash/:cardId", createCashOrder);

module.exports = router;
