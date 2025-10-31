const express = require("express");
const { allowRoles, protectRoutes } = require("../services/authServices");
const {
  addProductToCart,
  getUserCart,
  removeProductFromCart,
  updateCartQuantity,
  clearCart,
  applyCouponCode
} = require("../services/cartServices");
const { setUserIdToBody } = require("../middlewares/setUserIdToBody");
const {
  addProductToCartValidator,
  getUserCartValidator,
  clearCartValidator,
  removeProductFromCartValidator,
  updateCartQuantityValidator,
  applyCouponCodeValidator
} = require("../utils/validators/cartValidator");

const router = express.Router();

router.use(protectRoutes, allowRoles("user")); //! That way all routes below will be protected

router
  .route("/")
  .post(setUserIdToBody, addProductToCartValidator, addProductToCart)
  .get(getUserCartValidator, getUserCart);

router.route("/clear").delete(clearCartValidator, clearCart);

router.route("/apply-coupon").post(applyCouponCodeValidator, applyCouponCode);

router
  .route("/:productId")
  .patch(updateCartQuantityValidator, updateCartQuantity)
  .delete(removeProductFromCartValidator, removeProductFromCart);

module.exports = router;
