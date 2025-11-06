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
const { protectRoutes, allowRoles } = require("../services/authServices");
const {
  getUserById,
  deleteUser
} = require("../services/userServices(For Admin)");
const {
  uploadToCloudinary
} = require("../middlewares/uplaodToCloudinaryMiddleware");
const {
  resizeImageWithSharp
} = require("../middlewares/resizeImageWithSharpMiddleware");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

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
  resizeImageWithSharp("userPhoto", 500, 95),
  uploadToCloudinary(
    "ecommerce-api-express-uploads/users",
    (req) => req.body.userPhoto.tempFilename,
    "userPhoto"
  ),
  updateLoggedUserDataValidator,
  updateLoggedUserData
);

router.post("/logout", logoutUser);

router.delete("/deleteMe", deleteMeUserValidator, deleteUser);

module.exports = router;
