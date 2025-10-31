const express = require("express");

const router = express.Router();

const { protectRoutes, allowRoles } = require("../services/authServices");

const {
  addAddressToUserAddresses,
  addUserIdToBody,
  getUserAddresses,
  clearUserAddresses,
  deleteAddressFromUserAddresses
} = require("../services/userAddressesServices");
const {
  addAddressToUserAddressesValidator,
  getUserAddressesValidator,
  clearUserAddressesValidator,
  deleteAddressFromUserAddressesValidator
} = require("../utils/validators/userAddressesValidator");

router.use(protectRoutes, allowRoles("user")); //! That way all routes below will be protected

router
  .route("/")
  .post(addAddressToUserAddressesValidator, addAddressToUserAddresses)
  .get(addUserIdToBody, getUserAddressesValidator, getUserAddresses);

router
  .route("/clear")
  .delete(addUserIdToBody, clearUserAddressesValidator, clearUserAddresses);

router
  .route("/:addressId")
  .delete(
    deleteAddressFromUserAddressesValidator,
    deleteAddressFromUserAddresses
  );

module.exports = router;
