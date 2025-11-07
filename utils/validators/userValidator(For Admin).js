const bcrypt = require("bcryptjs");
const { default: slugify } = require("slugify");

const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");
const UserModel = require("../../models/userModel");

//*=====================================  (CREATE, GET, PUT, DELETE) User Data For Admin  =========================================

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value) => {
      const user = await UserModel.findOne({ email: value });
      if (user) {
        throw new Error("Email already in use!");
      }
    }),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .custom((value, { req }) => {
      if (value !== req.body.passwordConfirm) {
        throw new Error("Password confirmation does not match password");
      }
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{6,}$/;
      if (!passwordRegex.test(value)) {
        throw new Error(
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
      }
      return true;
    }),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required"),
  check("phone")
    .optional()
    .isMobilePhone([
      "ar-EG",
      "en-EG",
      "en-US",
      "en-GB",
      "en-CA",
      "en-AU",
      "en-NZ",
      "en-IE",
      "en-ZA",
      "en-JM",
      "ar-AE",
      "ar-KW",
      "ar-SA"
    ])
    .withMessage(
      "You must enter a valid phone number in Egyptian, England, USA, Canada, Australia, New Zealand, Ireland, South Africa, Jamaica, UAE, Kuwait or Saudi Arabia format!"
    ),
  check("role")
    .optional()
    .isIn(["user", "admin", "manager"])
    .withMessage("Role must be either 'user' or 'admin' or 'manager'"),
  check("active")
    .optional()
    .isBoolean()
    .withMessage("Active must be a boolean value"),
  validatorMiddleware
];

exports.updateUserValidator = [
  check("userId")
    .isMongoId()
    .withMessage("Invalid User ID Format")
    .notEmpty()
    .withMessage("User ID is Required!")
    .custom(async (value) => {
      const user = await UserModel.findById(value);
      if (!user) {
        throw new Error("User Not Found!");
      }
      return true;
    }),
  check("name")
    .optional()
    .notEmpty()
    .withMessage("Name must not be empty")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("email")
    .optional()
    .notEmpty()
    .withMessage("Email must not be empty")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value, { req }) => {
      const user = await UserModel.findOne({ email: value });
      if (user && user._id.toString() !== req.params.userId) {
        throw new Error("Email already in use!");
      }

      return true;
    }),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG"])
    .withMessage("Invalid egyptian phone number"),
  check("role")
    .optional()
    .isIn(["user", "admin", "manager"])
    .withMessage("Role must be either 'user' or 'admin' or 'manager'"),
  check("active")
    .optional()
    .isBoolean()
    .withMessage("Active must be a boolean value"),
  check("userPhoto")
    .optional()
    .custom((value) => {
      if (value) {
        if (
          typeof value.url !== "string" ||
          typeof value.imagePublicId !== "string"
        ) {
          throw new Error("Invalid user photo format!");
        }
      }

      return true;
    }),
  validatorMiddleware
];

exports.changeUserPasswordValidator = [
  check("userId")
    .isMongoId()
    .withMessage("Invalid User ID Format")
    .notEmpty()
    .withMessage("User ID is Required!"),
  check("currentPassword")
    .notEmpty()
    .withMessage("Current password is required")
    .custom(async (value, { req }) => {
      const user = await UserModel.findById(req.params.userId).select(
        "-__v +password +active"
      );
      if (!user) {
        throw new Error("User Not Found!");
      }

      const isPasswordCorrect = await bcrypt.compare(value, user.password);
      if (!isPasswordCorrect) {
        throw new Error("Current password is incorrect");
      }

      return true;
    }),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .custom((value, { req }) => {
      const currentPassword = req.body.currentPassword;
      if (value !== req.body.confirmPassword) {
        throw new Error("Password confirmation does not match password");
      }
      if (value === currentPassword) {
        throw new Error(
          "New password must be different from the current password"
        );
      }

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{6,}$/;
      if (!passwordRegex.test(value)) {
        throw new Error(
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
      }
      return true;
    }),
  check("confirmPassword")
    .notEmpty()
    .withMessage("Password confirmation is required"),
  validatorMiddleware
];

exports.getUserByIdValidator = [
  check("userId")
    .isMongoId()
    .withMessage("Invalid User ID Format")
    .notEmpty()
    .withMessage("User ID is Required!")
    .custom(async (value) => {
      const user = await UserModel.findById(value);
      if (!user) {
        throw new Error("User Not Found!");
      }
    }),
  validatorMiddleware
];

exports.deleteUserValidator = [
  check("userId")
    .isMongoId()
    .withMessage("Invalid User ID Format")
    .notEmpty()
    .withMessage("User ID is Required!")
    .custom(async (value) => {
      const user = await UserModel.findById(value);
      if (!user) {
        throw new Error("User Not Found!");
      }
      return true;
    }),
  validatorMiddleware
];

const allowedFields = [
  "_id",
  "name",
  "email",
  "userPhoto",
  "phone",
  "role",
  "active",
  "slug",
  "passwordChangedAt",
  "createdAt",
  "updatedAt",
  "__v"
];

exports.getAllUsersValidator = [
  check("page")
    .optional()
    .notEmpty()
    .withMessage("Page must not be empty")
    .isInt()
    .withMessage("Page must be an integer")
    .toInt()
    .default(1)
    .custom((value) => {
      if (value < 1) {
        throw new Error("Page Must Be Greater Than 0!");
      }
      return true;
    }),
  check("limit")
    .optional()
    .notEmpty()
    .withMessage("Limit must not be empty")
    .isInt()
    .withMessage("Limit must be an integer")
    .toInt()
    .default(30)
    .custom((value) => {
      if (value < 5) {
        throw new Error("Limit Must Be Greater Than 5!");
      }
      if (value > 30) {
        throw new Error("Limit Must Be Less Than 30!");
      }
      return true;
    }),
  check("search")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Search query cannot be empty.")
    .isString()
    .withMessage("Search must be a string")
    .isLength({ min: 3 })
    .withMessage("Search must be at least 3 characters long")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Search must not contain special characters"),
  check("fields")
    .optional()
    .custom((value) => {
      const searchFields = value.split(",");

      const invalidFields = searchFields
        .map((field) => (field.startsWith("-") ? field.slice(1) : field))
        .filter((field) => !allowedFields.includes(field));

      if (invalidFields.length > 0) {
        throw new Error(
          `The ${
            invalidFields.length === 1 ? "field" : "fields"
          } you entered ${invalidFields.length === 1 ? "is" : "are"} not valid: ${invalidFields.join(", ")}`
        );
      }
      return true;
    }),
  check("sort")
    .optional()
    .notEmpty()
    .withMessage("Sort query cannot be empty.")
    .custom((value) => {
      const sortFields = value.split(",");

      const invalidSortFields = sortFields
        .map((field) => (field.startsWith("-") ? field.slice(1) : field))
        .filter((field) => !allowedFields.includes(field));

      if (invalidSortFields.length > 0) {
        throw new Error(
          `The ${
            invalidSortFields.length === 1 ? "field" : "fields"
          } you entered ${invalidSortFields.length === 1 ? "is" : "are"} not valid: ${invalidSortFields.join(", ")}`
        );
      }
      return true;
    }),
  validatorMiddleware
];
