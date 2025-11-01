const express = require("express");
const { createCashOrder } = require("../services/orderServices");
const { allowRoles, protectRoutes } = require("../services/authServices");
const {
  createCashOrderValidator
} = require("../utils/validators/orderValidator");

const router = express.Router();

router.use(protectRoutes, allowRoles("user"));

router.post("/cash/:cardId", createCashOrderValidator, createCashOrder);

module.exports = router;
