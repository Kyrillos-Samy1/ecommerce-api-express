const express = require("express");
const {
  updateLoggedUserDataValidator,
  updateLoggedUserPasswordValidator,
  deleteMeUserValidator
} = require("../utils/validators/userValidator(For User)");
const {
  getMe,
  updateLoggedUserData,
  updateLoggedUserPassword,
  logoutUser
} = require("../services/userServices(For User)");
const { protectRoutes } = require("../services/authServices");
const {
  getUserById,
  uploadUserImage,
  resizeUserImage,
  deleteUser
} = require("../services/userServices(For Admin)");

//*================================================  CRUD For Current User  ============================================================

const router = express.Router();

router.use(protectRoutes); //! That way all routes below will be protected

router.get("/getMe", getMe, getUserById);

router.put(
  "/changePassword",
  updateLoggedUserPasswordValidator,
  updateLoggedUserPassword
);

router.put(
  "/updateMe",
  uploadUserImage,
  resizeUserImage,
  updateLoggedUserDataValidator,
  updateLoggedUserData
);

router.post("/logout", logoutUser);

router.delete("/deleteMe", deleteMeUserValidator, deleteUser);

module.exports = router;
