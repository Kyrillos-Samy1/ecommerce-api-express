const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");
const CartModel = require("../../models/cartModel");

exports.checkoutSessionValidator = [
  check("cartId")
    .trim()
    .isMongoId()
    .withMessage("Invalid Cart Id Format")
    .notEmpty()
    .withMessage("Cart ID is Required!")
    .custom(async (cartId, { req }) => {
      const cart = await CartModel.findById(cartId);
      if (!cart) {
        throw new Error(`No Cart Found For This ID: ${cartId}`);
      }

      if (cart.cartItems.length === 0 || !cart) {
        throw new Error("Cart is Empty!");
      }

      if (cart.user.toString() !== req.user._id.toString()) {
        throw new Error("You cannot create an order for another user");
      }

      return true;
    }),
  validatorMiddleware
];
