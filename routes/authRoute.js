const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  resetEmailCode,
  verifyResetCodeForSignUp,
  verifyResetCodeForForgotPassword
} = require("../services/authServices");
const {
  signupValidator,
  loginValidator,
  resetPasswordValidator,
  forgotPasswordValidator,
  resendEmailCodeValidator,
  verifyResetCodeValidatorForPassword,
  verifyResetCodeValidatorForSignUp
} = require("../utils/validators/authValidator");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const {
  resizeImageWithSharp
} = require("../middlewares/resizeImageWithSharpMiddleware");
const {
  uploadImageToCloudinary
} = require("../middlewares/uplaodToCloudinaryMiddleware");
const UserModel = require("../models/userModel");

const router = express.Router();

router.post(
  "/signup",
  uploadSingleImage("userPhoto"),
  resizeImageWithSharp("userPhoto", 500, 95, "userPhoto", UserModel, "User"),
  uploadImageToCloudinary("ecommerce-api-express-uploads/users", "userPhoto"),
  signupValidator,
  signup
);
router.post("/resetEmailCode", resendEmailCodeValidator, resetEmailCode);
router.post(
  "/verifyResetCodeForSignUp",
  verifyResetCodeValidatorForSignUp,
  verifyResetCodeForSignUp
);

router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPasswordValidator, forgotPassword);
router.post(
  "/verifyResetCodeForPassword",
  verifyResetCodeValidatorForPassword,
  verifyResetCodeForForgotPassword
);
router.put("/resetPassword", resetPasswordValidator, resetPassword);

module.exports = router;
