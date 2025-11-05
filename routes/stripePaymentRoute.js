const express = require("express");
const { protectRoutes, allowRoles } = require("../services/authServices");
const {
  checkoutSession,
  checkoutSessionSuccess,
  checkoutSessionCancel
} = require("../services/stripePaymentServices");
const {
  checkoutSessionValidator
} = require("../utils/validators/stripePaymentValidator");

const router = express.Router();

router.get(
  "/checkout-session/:cartId",
  protectRoutes,
  allowRoles("user"),
  checkoutSessionValidator,
  checkoutSession
);
router.get("/online/success", checkoutSessionSuccess);
router.get("/online/cancel", checkoutSessionCancel);

module.exports = router;
