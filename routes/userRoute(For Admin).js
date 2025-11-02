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
  uploadUserImage,
  resizeUserImage,
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  changeUserPassword
} = require("../services/userServices(For Admin)");
const { protectRoutes, allowRoles } = require("../services/authServices");

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
  .post(uploadUserImage, resizeUserImage, createUserValidator, createUser)
  .get(getAllUsersValidator, getAllUsers);

router
  .route("/:userId")
  .get(getUserByIdValidator, getUserById)
  .put(uploadUserImage, resizeUserImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
