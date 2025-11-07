const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword
} = require("../services/authServices");
const {
  signupValidator,
  loginValidator,
  resetPasswordValidator,
  forgotPasswordValidator,
  verifyResetCodeValidator
} = require("../utils/validators/authValidator");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const {
  resizeImageWithSharp
} = require("../middlewares/resizeImageWithSharpMiddleware");
const {
  uploadToCloudinary
} = require("../middlewares/uplaodToCloudinaryMiddleware");
const UserModel = require("../models/userModel");

const router = express.Router();

router.post(
  "/signup",
  uploadSingleImage("userPhoto"),
  resizeImageWithSharp("userPhoto", 500, 95, "userPhoto", UserModel, "User"),
  uploadToCloudinary("ecommerce-api-express-uploads/users", "userPhoto"),
  signupValidator,
  signup
);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPasswordValidator, forgotPassword);
router.post("/resetCode", verifyResetCodeValidator, verifyResetCode);
router.put("/resetPassword", resetPasswordValidator, resetPassword);

module.exports = router;
