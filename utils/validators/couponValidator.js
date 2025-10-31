const { check } = require("express-validator");
const CouponModel = require("../../models/couponModel");
const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");

exports.createCouponValidator = [
  check("coupon")
    .trim()
    .notEmpty()
    .withMessage("Coupon Name is Required!")
    .isLength({ min: 2 })
    .withMessage("Too Short Coupon Name!")
    .isLength({ max: 32 })
    .withMessage("Too Long Coupon Name!")
    .custom(async (coupon) => {
      const existingCoupon = await CouponModel.findOne({ coupon });
      if (existingCoupon) {
        throw new Error("Coupon Name Already Exists!");
      }
      return true;
    }),
  check("discount")
    .trim()
    .isNumeric()
    .withMessage("Discount Must Be a Number!")
    .notEmpty()
    .withMessage("Discount is Required!")
    .isInt({ min: 1, max: 100 })
    .withMessage("Discount Must Be Between 1 & 100!")
    .toFloat(),
  check("expireAt")
    .notEmpty()
    .withMessage("Expire Date is Required!")
    .custom((value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) throw new Error("Invalid Date Format!");

      if (date.getTime() < Date.now())
        throw new Error("Expire Date Must Be In Future!");

      if (date.getTime() > Date.now() + 3 * 24 * 60 * 60 * 1000)
        throw new Error("Expire Date Must Be Within 3 Days!");

      return true;
    }),
  // check("isActive")
  //   .optional()
  //   .isBoolean()
  //   .withMessage("Active must be a boolean value"),
  validatorMiddleware
];

const allowedFields = [
  "_id",
  "coupon",
  "discount",
  "expireAt",
  "isActive",
  "createdAt",
  "updatedAt",
  "__v"
];

exports.getAllCouponsValidator = [
  check("page")
    .optional()
    .notEmpty()
    .withMessage("Page query cannot be empty.")
    .isNumeric()
    .withMessage("Page Must Be a Number!")
    .toInt()
    .custom((value) => {
      if (value < 1) {
        throw new Error("Page Must Be Greater Than 0!");
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
        throw new Error("Limit Must Be Greater Than 5!");
      }
      if (value > 30) {
        throw new Error("Limit Must Be Less Than Or Equal To 30!");
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
        throw new Error(
          `The ${
            disAllowedFields.length === 1 ? "field" : "fields"
          } you entered ${disAllowedFields.length === 1 ? "is" : "are"} not valid: ${disAllowedFields.join(", ")}`
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
    .isString()
    .trim()
    .withMessage("Search must be a string")
    .notEmpty()
    .withMessage("Search query cannot be empty.")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Search can only contain letters, numbers, and spaces"),
  validatorMiddleware
];

exports.getCouponByIdValidator = [
  check("couponId")
    .isMongoId()
    .withMessage("Invalid Coupon Id Format")
    .notEmpty()
    .withMessage("Coupon ID is Required!")
    .custom(async (value) => {
      const coupon = await CouponModel.findById(value);
      if (!coupon) {
        throw new Error(`No Coupons For This Id: ${value}`);
      }

      if (!coupon.isActive && coupon.expireAt < new Date(Date.UTC())) {
        throw new Error(`Coupon Is Not Active!`);
      }

      if (coupon.expireAt < new Date(Date.UTC())) {
        throw new Error(`Coupon Is Expired!`);
      }

      return true;
    }),
  validatorMiddleware
];

exports.updateCouponValidator = [
  check("coupon")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Too Short Coupon Name!")
    .isLength({ max: 32 })
    .withMessage("Too Long Coupon Name!")
    .custom(async (coupon) => {
      const existingCoupon = await CouponModel.findOne({ coupon });

      if (existingCoupon) {
        throw new Error("Coupon Name Already Exists!");
      }
      return true;
    }),
  check("discount")
    .optional()
    .trim()
    .toFloat()
    .isNumeric()
    .withMessage("Discount Must Be a Number!")
    .isInt({ min: 1, max: 100 })
    .withMessage("Discount Must Be Between 1 & 100!"),
  check("expireAt")
    .optional()
    .trim()
    .custom((value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) throw new Error("Invalid Date Format!");

      if (date.getTime() < Date.now())
        throw new Error("Expire Date Must Be In Future!");

      if (date.getTime() > Date.now() + 3 * 24 * 60 * 60 * 1000)
        throw new Error("Expire Date Must Be Within 3 Days!");

      return true;
    }),
  // check("isActive")
  //   .optional()
  //   .isBoolean()
  //   .withMessage("Active must be a boolean value")
  //   .custom(async (value, { req }) => {
  //     const coupon = await CouponModel.findById(req.params.couponId);
  //     if (!coupon) {
  //       throw new Error(`No Coupons For This Id: ${req.params.couponId}`);
  //     }

  //     if (value && new Date(coupon.expireAt).getTime() < Date.now()) {
  //       throw new Error("Coupon Is Expired!");
  //     }

  //     if (value === false && coupon.expireAt.getTime() > Date.now()) {
  //       throw new Error("You Can Not Deactivate A Coupon That Is Not Expired!");
  //     }

  //     return true;
  //   }),
  validatorMiddleware
];

exports.deleteCouponValidator = [
  check("couponId")
    .isMongoId()
    .withMessage("Invalid Coupon Id Format")
    .notEmpty()
    .withMessage("Coupon ID is Required!")
    .custom(async (couponId, { req }) => {
      const coupon = await CouponModel.findById(couponId);
      if (!coupon) {
        throw new Error(`No Coupons For This Id: ${couponId}`);
      }

      return true;
    }),
  validatorMiddleware
];
