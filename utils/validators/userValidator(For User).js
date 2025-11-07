const bcrypt = require("bcryptjs");

const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");
const UserModel = require("../../models/userModel");
const APIError = require("../apiError");

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
  // check("userPhoto").custom(async (_value, { req }) => {
  //   if (!req.file) {
  //     throw new Error("User photo is required");
  //   }
  //   return true;
  // }),
  validatorMiddleware
];

exports.updateUserPhotoValidator = [
  check("userPhoto").custom(async (_value, { req }) => {
    const user = await UserModel.findById(req.params.userId || req.user._id);

    if (!user) {
      req.validationMessage = `No User Found For This ID: ${req.user._id}`;
      return true;
    }

    if (!user.userPhoto) {
      req.validationMessage = "User Has No Image!";
      return true;
    }

    const originalName = user.userPhoto.imagePublicId.split("/")[2];

    if (originalName === req.body.userPhoto.tempFilename) {
      req.validationMessage = `New Image Can't Be Same As Old Image: ${user.userPhoto.url}`;
      return true;
    }

    return true;
  }),
  (req, res, next) => {
    if (req.validationMessage) {
      return next(new APIError(req.validationMessage, 400, "ValidationError"));
    }
    next();
  }
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
