const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  resetEmailCode
} = require("../services/authServices");
const {
  signupValidator,
  loginValidator,
  resetPasswordValidator,
  forgotPasswordValidator,
  verifyResetCodeValidator,
  resetEmailCodeValidator
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
router.post("/resetEmailCode", resetEmailCodeValidator, resetEmailCode);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPasswordValidator, forgotPassword);
router.post(
  "/resetCodeForPassword",
  verifyResetCodeValidator,
  verifyResetCode({
    isForgotPasswordCodeVerified: true
  })
);
router.post(
  "/resetCodeForSignUp",
  verifyResetCodeValidator,
  verifyResetCode({
    isEmailVerified: true,
    resetCode: "",
    resetCodeExpires: ""
  })
);
router.put("/resetPassword", resetPasswordValidator, resetPassword);

module.exports = router;
