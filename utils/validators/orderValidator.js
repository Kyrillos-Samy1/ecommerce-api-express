const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");
const CartModel = require("../../models/cartSchema");
const OrderModel = require("../../models/orderSchema");

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

      if (value.fullName.length < 3 || value.fullName.length > 50) {
        throw new Error("Full name must be between 3 and 50 characters");
      }

      if (value.address.length < 3 || value.address.length > 200) {
        throw new Error("Address must be between 3 and 200 characters");
      }

      if (value.city.length < 3 || value.city.length > 100) {
        throw new Error("City must be between 3 and 100 characters");
      }

      if (value.country.length < 2 || value.country.length > 100) {
        throw new Error("Country must be between 2 and 100 characters");
      }

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

  check("paymentMethod")
    .optional()
    .isIn(["cash", "card"])
    .withMessage("Payment method must be either 'cash' or 'card'"),
  check("paymentResult")
    .optional()
    .isObject()
    .withMessage("Payment result must be an object")
    .custom((value) => {
      const allowedFields = ["id", "status", "update_time", "email_address"];
      const invalidFields = Object.keys(value).filter(
        (key) => !allowedFields.includes(key)
      );

      if (invalidFields.length > 0) {
        throw new Error(
          `Invalid payment result fields: ${invalidFields.join(", ")}`
        );
      }

      return true;
    }),
  validatorMiddleware
];

exports.getSpecificOrderValidator = [
  check("orderId")
    .trim()
    .isMongoId()
    .withMessage("Invalid Order ID format")
    .notEmpty()
    .withMessage("Order ID is required")
    .custom(async (value, { req }) => {
      const order = await OrderModel.findById(value);
      if (!order) {
        throw new Error(`Order not found with this ID: ${value}`);
      }

      if (order.user.toString() !== req.user._id.toString()) {
        throw new Error("You cannot get an order for another user");
      }

      if (order.isCancelled) {
        throw new Error("This order has been cancelled");
      }

      return true;
    }),
  validatorMiddleware
];

exports.cancelOrderValidator = [
  check("orderId")
    .trim()
    .isMongoId()
    .withMessage("Invalid Order ID format")
    .notEmpty()
    .withMessage("Order ID is required")
    .custom(async (value, { req }) => {
      const order = await OrderModel.findById(value);
      if (!order) {
        throw new Error(`Order not found with this ID: ${value}`);
      }

      if (order.user.toString() !== req.user._id.toString()) {
        throw new Error("You cannot cancel an order for another user");
      }

      if (order.isCancelled) {
        throw new Error("This order has already been cancelled");
      }

      return true;
    }),
  validatorMiddleware
];
