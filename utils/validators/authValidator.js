const { check } = require("express-validator");
const crypto = require("crypto");
const { default: slugify } = require("slugify");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");
const UserModel = require("../../models/userModel");

exports.signupValidator = [
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
        const msLeft = user.emailVerificationCodeExpires - Date.now();
        const minutes = Math.floor(msLeft / 60000);
        const seconds = Math.floor((msLeft % 60000) / 1000);

        const leftTime = `${minutes}m ${seconds}s`;

        if (user.emailVerificationCodeExpires > Date.now()) {
          throw new Error(
            `Reset code already sent. Try again later after ${leftTime}`
          );
        }

        if (
          !user.isEmailVerified &&
          user.emailVerificationCodeExpires < Date.now()
        ) {
          throw new Error(
            "Email is not verified yet. Please verify your email first."
          );
        }
      }

      if (user) {
        throw new Error("Email already in use!");
      }

      return true;
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

exports.resendEmailCodeValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value, { req }) => {
      const user = await UserModel.findOne({ email: value });
      if (!user) {
        throw new Error(`There is no user with this email address: ${value}`);
      }

      const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET_KEY);

      if (user._id.toString() !== decoded.userId) {
        throw new Error("Unauthorized Access!");
      }

      if (user.isEmailVerified) {
        throw new Error("Email is Already Verified!");
      }

      const msLeft = user.emailVerificationCodeExpires - Date.now();
      const minutes = Math.floor(msLeft / 60000);
      const seconds = Math.floor((msLeft % 60000) / 1000);

      const leftTime = `${minutes}m ${seconds}s`;

      if (user.emailVerificationCodeExpires > Date.now()) {
        throw new Error(
          `Reset code already sent. Try again later after ${leftTime}`
        );
      }

      return true;
    }),
  validatorMiddleware
];

exports.verifyResetCodeValidatorForSignUp = [
  check("resetCodeForSignUp")
    .notEmpty()
    .withMessage("Reset Code is required")
    .isLength({ min: 6 })
    .withMessage("Reset Code must be at least 6 characters long")
    .custom(async (value) => {
      const hashedResetCode = crypto
        .createHash("sha256")
        .update(value)
        .digest("hex");

      const user = await UserModel.findOne({
        emailVerificationCode: hashedResetCode,
        isEmailVerified: false
      });

      if (!user) {
        throw new Error("Reset Code is Invalid or Already Verified!");
      }

      if (user.emailVerificationCodeExpires < Date.now())
        throw new Error("Reset Code is Expired");

      if (user.isEmailVerified) throw new Error("Email is Already Verified!");
      return true;
    }),
  validatorMiddleware
];

exports.loginValidator = [
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .custom(async (value, { req }) => {
      const user = await UserModel.findOne({ email: req.body.email }).select(
        "+password"
      );
      if (user && !(await bcrypt.compare(value, user.password))) {
        throw new Error("Incorrect password");
      }

      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value) => {
      const user = await UserModel.findOne({ email: value }).select(
        "+password"
      );
      if (!user) {
        throw new Error("Incorrect email!");
      }
    }),
  validatorMiddleware
];

exports.forgotPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value) => {
      const user = await UserModel.findOne({ email: value });
      if (!user) {
        throw new Error(`There is no user with this email address: ${value}`);
      }

      const msLeft = user.resetPasswordCodeExpires - Date.now();
      const minutes = Math.floor(msLeft / 60000);
      const seconds = Math.floor((msLeft % 60000) / 1000);

      const leftTime = `${minutes}m ${seconds}s`;

      if (user.resetPasswordCodeExpires > Date.now()) {
        throw new Error(
          `Reset code already sent. Try again later after ${leftTime}`
        );
      }

      return true;
    }),
  validatorMiddleware
];

exports.verifyResetCodeValidatorForPassword = [
  check("resetCodeForForgotPassword")
    .notEmpty()
    .withMessage("Reset Code is required")
    .isLength({ min: 6 })
    .withMessage("Reset Code must be at least 6 characters long")
    .custom(async (value) => {
      const hashedResetCode = crypto
        .createHash("sha256")
        .update(value)
        .digest("hex");

      const user = await UserModel.findOne({
        resetPasswordCode: hashedResetCode,
        isForgotPasswordCodeVerified: false
      });

      if (!user) {
        throw new Error("Reset Code is Invalid or Already Verified!");
      }

      if (user.resetPasswordCodeExpires < Date.now())
        throw new Error("Reset Code is Expired");

      if (user.isForgotPasswordCodeVerified)
        throw new Error("Reset Code is Already Verified!");
      return true;
    }),
  validatorMiddleware
];

exports.resetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value) => {
      const user = await UserModel.findOne({ email: value });
      if (!user) {
        throw new Error(`There is no user with this email address: ${value}`);
      }

      if (!user.isForgotPasswordCodeVerified) {
        throw new Error("Reset Code is Not Verified!");
      }

      if (user.resetPasswordCodeExpires < Date.now()) {
        throw new Error("Reset Code is Expired");
      }

      return true;
    }),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .custom(async (value, { req }) => {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{6,}$/;
      if (!passwordRegex.test(value)) {
        throw new Error(
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
      }

      const user = await UserModel.findOne({ email: req.body.email }).select(
        "+password +active"
      );

      if (!user) {
        throw new Error("User not found while validating password");
      }

      const isSamePassword = await bcrypt.compare(value, user.password);

      if (isSamePassword) {
        throw new Error(
          "New password must be different from the current password"
        );
      }

      return true;
    }),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  validatorMiddleware
];
