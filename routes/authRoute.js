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

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPasswordValidator, forgotPassword);
router.post("/resetCode", verifyResetCodeValidator, verifyResetCode);
router.put("/resetPassword", resetPasswordValidator, resetPassword);

module.exports = router;
