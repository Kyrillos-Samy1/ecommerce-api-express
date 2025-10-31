const express = require("express");

const router = express.Router();

const {
  addProductToWishlistValidator
} = require("../utils/validators/wishlistValidator");

const {
  addProductToWishlist,
  deleteProductFromWishlist,
  clearWishlist,
  getUserWishlist
} = require("../services/wishlistServices");
const { protectRoutes, allowRoles } = require("../services/authServices");
const {
  deleteProductFromWishlistValidator
} = require("../utils/validators/wishlistValidator");
const {
  clearWishlistValidator
} = require("../utils/validators/wishlistValidator");
const {
  getUserWishlistValidator
} = require("../utils/validators/wishlistValidator");
const { setUserIdToBody } = require("../middlewares/setUserIdToBody");

router.use(protectRoutes, allowRoles("user")); //! That way all routes below will be protected

router
  .route("/")
  .post(addProductToWishlistValidator, addProductToWishlist)
  .get(setUserIdToBody, getUserWishlistValidator, getUserWishlist);

router
  .route("/clear")
  .delete(setUserIdToBody, clearWishlistValidator, clearWishlist);

router
  .route("/:productId")
  .delete(deleteProductFromWishlistValidator, deleteProductFromWishlist);

module.exports = router;
