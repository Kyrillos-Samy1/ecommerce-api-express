const express = require("express");
const {
  updateLoggedUserDataValidator,
  updateLoggedUserPasswordValidator,
  deleteMeUserValidator,
  updateUserPhotoValidator
} = require("../utils/validators/userValidator(For User)");
const {
  getMe,
  updateLoggedUserData,
  updateLoggedUserPassword,
  logoutUser,
  deleteImageFromCloudinaryBeforeDeleteUser
} = require("../services/userServices(For User)");
const { protectRoutes, allowRoles } = require("../services/authServices");
const {
  getUserById,
  deleteUser
} = require("../services/userServices(For Admin)");
const {
  uploadImageToCloudinary
} = require("../middlewares/uplaodToCloudinaryMiddleware");
const {
  resizeImageWithSharp
} = require("../middlewares/resizeImageWithSharpMiddleware");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const UserModel = require("../models/userModel");

//*================================================  CRUD For Current User  ============================================================

const router = express.Router();

router.use(protectRoutes, allowRoles("user", "admin")); //! That way all routes below will be protected

router.get("/getMe", getMe, getUserById);

router.patch(
  "/changePassword",
  updateLoggedUserPasswordValidator,
  updateLoggedUserPassword
);

router.patch(
  "/updateMe",
  uploadSingleImage("userPhoto"),
  resizeImageWithSharp("userPhoto", 500, 95, "", UserModel, "User"),
  updateUserPhotoValidator,
  uploadImageToCloudinary("ecommerce-api-express-uploads/users", "userPhoto"),
  updateLoggedUserDataValidator,
  updateLoggedUserData
);

router.post("/logout", logoutUser);

router.delete(
  "/deleteMe",
  deleteMeUserValidator,
  deleteImageFromCloudinaryBeforeDeleteUser,
  deleteUser
);

module.exports = router;
