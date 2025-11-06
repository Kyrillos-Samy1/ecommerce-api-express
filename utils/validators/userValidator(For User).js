const bcrypt = require("bcryptjs");

const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");
const UserModel = require("../../models/userModel");

//*=================================================  For Logged User ==============================================

exports.updateLoggedUserDataValidator = [
  check("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name must not contain special characters"),
  check("email")
    .optional()
    .notEmpty()
    .withMessage("Email must not be empty")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value) => {
      const user = await UserModel.findOne({ email: value });
      if (user) {
        throw new Error("Email already in use!");
      }
      return true;
    }),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG"])
    .withMessage("Invalid egyptian phone number"),
  check("userPhoto")
    .optional()
    .custom((value) => {
      if (
        typeof value.url !== "string" ||
        typeof value.imagePublicId !== "string"
      ) {
        throw new Error("Invalid user photo format!");
      }

      return true;
    }),
  validatorMiddleware
];

exports.updateLoggedUserPasswordValidator = [
  check("currentPassword")
    .notEmpty()
    .withMessage("Current password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .custom(async (value, { req }) => {
      const user = await UserModel.findById(req.user._id).select(
        "-__v +password +active"
      );
      const isPasswordCorrect = await bcrypt.compare(value, user.password);
      if (!isPasswordCorrect) {
        throw new Error("Current password is incorrect");
      }

      return true;
    }),
  check("password")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error(
          "New password cannot be the same as the current password"
        );
      }
      return true;
    }),
  check("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  validatorMiddleware
];

exports.deleteMeUserValidator = [
  check("userId").custom(async (_userId, { req }) => {
    const value = req.user._id;
    const user = await UserModel.findById(value);
    if (!user) {
      throw new Error("User Not Found!");
    }

    if (req.user._id.toString() !== value.toString()) {
      throw new Error("You cannot delete another user!");
    }
    return true;
  }),
  validatorMiddleware
];
