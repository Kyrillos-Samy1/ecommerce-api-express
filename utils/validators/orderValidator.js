const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");
const CartModel = require("../../models/cartSchema");

exports.createCashOrderValidator = [
  check("cardId")
    .trim()
    .isMongoId()
    .withMessage("Invalid Card ID format")
    .notEmpty()
    .withMessage("Card ID is required")
    .custom(async (value, { req }) => {
      const cart = await CartModel.findById(value);
      if (!cart) {
        throw new Error("Cart not found with this ID");
      }

      if (cart.user.toString() !== req.user._id.toString()) {
        throw new Error("You cannot create an order for another user");
      }

      if (cart.cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      return true;
    }),
  validatorMiddleware
];
