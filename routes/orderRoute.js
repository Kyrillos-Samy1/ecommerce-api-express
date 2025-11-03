const express = require("express");
const {
  createCashOrder,
  getLoggedUserOrders,
  getSpecificOrder,
  cancelOrder,
  updateOrderIsPaidStatus,
  updateOrderIsDeliveredStatus
} = require("../services/orderServices");
const { allowRoles, protectRoutes } = require("../services/authServices");
const {
  createCashOrderValidator,
  getSpecificOrderValidator,
  cancelOrderValidator,
  updateOrderIsPaidStatusValidator,
  updateOrderIsDeliveredStatusValidator
} = require("../utils/validators/orderValidator");

const router = express.Router();

router.use(protectRoutes);

router.get("/", allowRoles("user"), getLoggedUserOrders);

router
  .route("/:orderId")
  .get(allowRoles("user"), getSpecificOrderValidator, getSpecificOrder)
  .put(allowRoles("user"), cancelOrderValidator, cancelOrder)
  .patch(
    allowRoles("admin", "manager"),
    updateOrderIsDeliveredStatusValidator,
    updateOrderIsDeliveredStatus
  );

router
  .route("/cash/:orderId")
  .patch(
    allowRoles("admin", "manager"),
    updateOrderIsPaidStatusValidator,
    updateOrderIsPaidStatus
  );

router
  .route("/cash/:cardId")
  .post(allowRoles("user"), createCashOrderValidator, createCashOrder);

module.exports = router;
