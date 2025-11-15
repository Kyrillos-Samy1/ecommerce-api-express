const express = require("express");
const {
  createCashOrder,
  getLoggedUserOrders,
  getSpecificOrder,
  cancelOrder,
  updateOrderIsPaidStatus,
  updateOrderIsDeliveredStatus,
  getAllOrdersForAdmin
} = require("../services/orderServices");
const { allowRoles, protectRoutes } = require("../services/authServices");
const {
  createCashOrderValidator,
  getSpecificOrderValidator,
  cancelOrderValidator,
  updateOrderIsPaidStatusValidator,
  updateOrderIsDeliveredStatusValidator,
  getAllOrdersForAdminValidator
} = require("../utils/validators/orderValidator");

const router = express.Router();

router.use(protectRoutes);

router
  .route("/forAdmin")
  .get(
    allowRoles("admin", "manager"),
    getAllOrdersForAdminValidator,
    getAllOrdersForAdmin
  );

router.route("/").get(allowRoles("user"), getLoggedUserOrders);

router
  .route("/:orderId/order")
  .get(
    allowRoles("user", "admin", "manager"),
    getSpecificOrderValidator,
    getSpecificOrder
  )
  .put(
    allowRoles("user", "admin", "manager"),
    cancelOrderValidator,
    cancelOrder
  );

router
  .route("/:orderId/deliver")
  .patch(
    allowRoles("admin", "manager"),
    updateOrderIsDeliveredStatusValidator,
    updateOrderIsDeliveredStatus
  );

router
  .route("/cash/:orderId/pay")
  .patch(
    allowRoles("admin", "manager"),
    updateOrderIsPaidStatusValidator,
    updateOrderIsPaidStatus
  );

router
  .route("/cash/:cardId")
  .post(allowRoles("user"), createCashOrderValidator, createCashOrder);

module.exports = router;
