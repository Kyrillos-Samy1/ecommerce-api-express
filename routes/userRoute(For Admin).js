const express = require("express");
const {
  createUserValidator,
  updateUserValidator,
  changeUserPasswordValidator,
  getAllUsersValidator,
  getUserByIdValidator,
  deleteUserValidator
} = require("../utils/validators/userValidator(For Admin)");
const {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  changeUserPassword
} = require("../services/userServices(For Admin)");
const { protectRoutes, allowRoles } = require("../services/authServices");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const {
  resizeImageWithSharp
} = require("../middlewares/resizeImageWithSharpMiddleware");
const {
  uploadToCloudinary
} = require("../middlewares/uplaodToCloudinaryMiddleware");

//*================================================  CRUD For Admin  ================================================

const router = express.Router();

router.use(protectRoutes, allowRoles("admin")); //! That way all routes below will be protected

router.put(
  "/change-password/:userId",
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route("/")
  .post(
    uploadSingleImage("userPhoto"),
    resizeImageWithSharp("userPhoto", 500, 95),
    uploadToCloudinary(
      "ecommerce-api-express-uploads/users",
      (req) => req.body.userPhoto.tempFilename,
      "userPhoto"
    ),
    createUserValidator,
    createUser
  )
  .get(getAllUsersValidator, getAllUsers);

router
  .route("/:userId")
  .get(getUserByIdValidator, getUserById)
  .patch(
    uploadSingleImage("userPhoto"),
    resizeImageWithSharp("userPhoto", 500, 95),
    uploadToCloudinary(
      "ecommerce-api-express-uploads/users",
      (req) => req.body.userPhoto.tempFilename,
      "userPhoto"
    ),
    updateUserValidator,
    updateUser
  )
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
