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
  check("shippingAddress")
    .notEmpty()
    .withMessage("Shipping address is required")
    .isObject()
    .withMessage("Shipping address must be an object")
    .custom((value) => {
      const requiredFields = [
        "fullName",
        "address",
        "city",
        "postalCode",
        "country",
        "phone"
      ];
      const missingFields = requiredFields.filter(
        (field) => !Object.prototype.hasOwnProperty.call(value, field)
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      Object.entries(value).forEach(([key, val]) => {
        if (typeof val !== "string" || val.trim() === "") {
          throw new Error(`Field "${key}" must be a non-empty string`);
        }
      });

      if (!/^(\+20)?01[0125]\d{8}$/.test(value.phone)) {
        throw new Error(
          "Invalid Egyptian phone number format. eg: +201XXXXXXXXX or 01XXXXXXXXX"
        );
      }

      if (!/^\d{5}$/.test(value.postalCode)) {
        throw new Error("Postal code must be a 5-digit number");
      }

      if (!/^\d+$/.test(value.postalCode)) {
        throw new Error("Postal code must be a number");
      }

      if (!/^\d+$/.test(value.phone)) {
        throw new Error("Phone number must be a number");
      }

      

      return true;
    }),
  validatorMiddleware
];
