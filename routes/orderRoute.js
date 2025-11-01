const express = require("express");
const {
  createCashOrder,
  getLoggedUserOrders,
  getSpecificOrder,
  cancelOrder
} = require("../services/orderServices");
const { allowRoles, protectRoutes } = require("../services/authServices");
const {
  createCashOrderValidator,
  getSpecificOrderValidator,
  cancelOrderValidator
} = require("../utils/validators/orderValidator");

const router = express.Router();

router.use(protectRoutes, allowRoles("user"));

router.post("/cash/:cardId", createCashOrderValidator, createCashOrder);

router.get("/", getLoggedUserOrders);

router
  .route("/:orderId")
  .get(getSpecificOrderValidator, getSpecificOrder)
  .put(cancelOrderValidator, cancelOrder);

module.exports = router;
