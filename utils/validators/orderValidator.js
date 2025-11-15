const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");
const CartModel = require("../../models/cartModel");
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
    .isMongoId()
    .withMessage("Invalid Order ID format")
    .notEmpty()
    .withMessage("Order ID is required")
    .custom(async (value, { req }) => {
      const order = await OrderModel.findById(value);
      if (!order) {
        throw new Error(`Order not found with this ID: ${value}`);
      }

      if (order.user._id.toString() !== req.user._id.toString()) {
        throw new Error("You cannot get an order for another user");
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

      if (order.isDelivered) {
        throw new Error("This order has already been delivered");
      }

      if (!order.orderItems.length) {
        throw new Error("This order is empty");
      }

      return true;
    }),
  validatorMiddleware
];

//!===================================================== FOR ADMIN or MANAGER ======================================================

const allowedFields = [
  "user",
  "orderItems",
  "name",
  "email",
  "address",
  "city",
  "country",
  "phone",
  "postalCode",
  "paymentMethod",
  "paymentResult",
  "isCancelled",
  "isDelivered",
  "isPaid",
  "paidAt",
  "deliveredAt",
  "createdAt",
  "updatedAt",
  "finalTotalPriceAfterTaxAndShippingAdded",
  "totalOrderPriceBeforeDiscount",
  "totalPriceAfterDiscount",
  "totalPriceAfterCouponApplied",
  "couponApplied",
  "taxPrice",
  "shippingAddress",
  "shippingPrice",
  "totalPrice",
  "__v"
];

exports.getAllOrdersForAdminValidator = [
  check("page")
    .optional()
    .notEmpty()
    .withMessage("Page query cannot be empty.")
    .isNumeric()
    .withMessage("Page Must Be a Number!")
    .toInt()
    .custom((value) => {
      if (value < 1) {
        return Promise.reject(new Error("Page Must Be Greater Than 0!"));
      }
      return true;
    }),
  check("limit")
    .optional()
    .notEmpty()
    .withMessage("Limit query cannot be empty.")
    .isNumeric()
    .withMessage("Limit Must Be a Number!")
    .toInt()
    .custom((value) => {
      if (value < 5) {
        return Promise.reject(new Error("Limit Must Be Greater Than 5!"));
      }
      if (value > 30) {
        return Promise.reject(
          new Error("Limit Must Be Less Than Or Equal To 30!")
        );
      }
      return true;
    }),
  check("fields")
    .optional()
    .notEmpty()
    .withMessage("Fields query cannot be empty.")
    .custom((value) => {
      const fields = value.split(",");
      const disAllowedFields = [];

      fields.forEach((field) => {
        const cleanFields = field.startsWith("-") ? field.slice(1) : field;

        if (!allowedFields.includes(cleanFields)) {
          disAllowedFields.push(field);
        }
      });

      if (disAllowedFields.length > 0) {
        return Promise.reject(
          new Error(
            `The ${
              disAllowedFields.length === 1 ? "field" : "fields"
            } you entered ${disAllowedFields.length === 1 ? "is" : "are"} not valid: ${disAllowedFields.join(", ")}`
          )
        );
      }

      return true;
    }),
  check("sort")
    .optional()
    .notEmpty()
    .withMessage("Sort query cannot be empty.")
    .custom((value) => {
      const sorts = value.split(",");
      const disAllowedSorts = [];

      sorts.forEach((sort) => {
        const cleanSort = sort.startsWith("-") ? sort.slice(1) : sort;

        if (!allowedFields.includes(cleanSort)) {
          disAllowedSorts.push(sort);
        }
      });

      if (disAllowedSorts.length > 0) {
        throw new Error(
          `The ${
            disAllowedSorts.length === 1 ? "sort" : "sorts"
          } you entered ${disAllowedSorts.length === 1 ? "is" : "are"} not valid: ${disAllowedSorts.join(", ")}`
        );
      }

      return true;
    }),
  check("search")
    .optional()
    .trim()
    .isString()
    .withMessage("Search must be a string")
    .notEmpty()
    .withMessage("Search query cannot be empty."),
  validatorMiddleware
];

exports.updateOrderIsPaidStatusValidator = [
  check("orderId")
    .trim()
    .isMongoId()
    .withMessage("Invalid Order ID format")
    .notEmpty()
    .withMessage("Order ID is required")
    .custom(async (value) => {
      const order = await OrderModel.findById(value);
      if (!order) {
        throw new Error(`Order not found with this ID: ${value}`);
      }

      if (order.isPaid) {
        throw new Error("This order has already been paid!");
      }

      if (order.isCancelled) {
        throw new Error("This order has already been cancelled!");
      }

      return true;
    }),
  validatorMiddleware
];

exports.updateOrderIsDeliveredStatusValidator = [
  check("orderId")
    .trim()
    .isMongoId()
    .withMessage("Invalid Order ID format")
    .notEmpty()
    .withMessage("Order ID is required")
    .custom(async (value) => {
      const order = await OrderModel.findById(value);
      if (!order) {
        throw new Error(`Order not found with this ID: ${value}`);
      }

      if (order.isDelivered) {
        throw new Error("This order has already been delivered!");
      }

      if (order.isCancelled) {
        throw new Error("This order has already been cancelled!");
      }

      return true;
    }),
  validatorMiddleware
];
