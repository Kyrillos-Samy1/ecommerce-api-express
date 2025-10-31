const express = require("express");

const { protectRoutes, allowRoles } = require("../services/authServices");
const {
  createCouponValidator,
  getAllCouponsValidator,
  getCouponByIdValidator,
  updateCouponValidator,
  deleteCouponValidator
} = require("../utils/validators/couponValidator");
const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon
} = require("../services/couponServices");
// const { checkIsActiveValue } = require("../middlewares/checkIsActiveValue");

const router = express.Router();

router.use(protectRoutes, allowRoles("admin", "manager"));

router
  .route("/")
  .post(createCouponValidator, createCoupon)
  .get(getAllCouponsValidator, getAllCoupons);

router
  .route("/:couponId")
  .get(getCouponByIdValidator, getCouponById)
  .put(updateCouponValidator, updateCoupon)
  .delete(deleteCouponValidator, deleteCoupon);

module.exports = router;
