const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");
const ProductModel = require("../../models/productModel");
const UserModel = require("../../models/userModel");

exports.addProductToWishlistValidator = [
  check("productId")
    .isMongoId()
    .withMessage("Invalid Product Id Format")
    .notEmpty()
    .withMessage("Product ID is Required!")
    .custom(async (productId, { req }) => {
      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new Error(`No Product Found For This ID: ${productId}`);
      }

      const user = await UserModel.findById(req.user._id);
      if (!user) {
        throw new Error(`No User Found For This ID: ${req.user._id}`);
      }

      if (user.wishlist.includes(productId)) {
        throw new Error("Product Already Added To Your Wishlist!");
      }

      return true;
    }),

  validatorMiddleware
];

exports.getUserWishlistValidator = [
  check("userId").custom(async (value, { req }) => {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      throw new Error("User Not Found!");
    }

    if (!user.wishlist.length) {
      throw new Error("Your Wishlist Is Empty!");
    }

    return true;
  }),
  validatorMiddleware
];

exports.deleteProductFromWishlistValidator = [
  check("productId")
    .isMongoId()
    .withMessage("Invalid Product Id Format")
    .notEmpty()
    .withMessage("Product ID is Required!")
    .custom(async (productId, { req }) => {
      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new Error(`No Product Found For This ID: ${productId}`);
      }

      const user = await UserModel.findById(req.user._id);
      if (!user) {
        throw new Error(`No User Found For This ID: ${req.user._id}`);
      }

      if (!user.wishlist.includes(productId)) {
        throw new Error("Product Not Found In Your Wishlist!");
      }

      return true;
    }),
  validatorMiddleware
];

exports.clearWishlistValidator = [
  check("userId").custom(async (value, { req }) => {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      throw new Error("User Not Found!");
    }

    if (!user.wishlist.length) {
      throw new Error("Your Wishlist is Empty!");
    }

    return true;
  }),
  validatorMiddleware
];
