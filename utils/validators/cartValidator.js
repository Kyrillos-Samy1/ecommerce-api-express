const { check } = require("express-validator");

const ProductModel = require("../../models/productModel");
const UserModel = require("../../models/userModel");
const CartModel = require("../../models/cartSchema");
const CouponModel = require("../../models/couponModel");

const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");

exports.addProductToCartValidator = [
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

      return true;
    }),
  check("user").custom(async (_userId, { req }) => {
    const user = await UserModel.findById(req.user._id);

    if (!user) {
      throw new Error(`No User Found For This ID: ${req.user._id}`);
    }

    if (user._id.toString() !== req.user._id.toString()) {
      throw new Error("User ID does not match the logged-in account!");
    }

    return true;
  }),
  check("color")
    .notEmpty()
    .withMessage("Color is Required!")
    .isString()
    .withMessage("Color must be a string!")
    .custom(async (color, { req }) => {
      const product = await ProductModel.findById(req.body.productId);
      if (product.colors && product.colors.length) {
        const exists = product.colors.some(
          (item) => item.toLowerCase() === color.toLowerCase()
        );
        if (!exists) {
          throw new Error(
            `Oops! The color '${color}' isn’t available for this product. You can choose from: ${product.colors.join(", ")}.`
          );
        }
      }

      return true;
    }),
  check("size")
    .trim()
    .notEmpty()
    .withMessage("Size is Required!")
    .isString()
    .withMessage("Size must be a string!")
    .custom(async (size, { req }) => {
      const product = await ProductModel.findById(req.body.productId);
      if (product.sizes && product.sizes.length) {
        const exists = product.sizes.some(
          (item) => item.toLowerCase() === size.toLowerCase()
        );
        if (!exists) {
          throw new Error(
            `Oops! The size '${size}' isn’t available for this product. You can choose from: ${product.sizes.join(", ")}.`
          );
        }
      }

      return true;
    }),
  check("quantity")
    .notEmpty()
    .withMessage("Quantity is Required!")
    .isNumeric()
    .withMessage("Quantity must be a number!")
    .custom(async (quantity, { req }) => {
      const product = await ProductModel.findById(req.body.productId);
      if (quantity > product.quantity) {
        throw new Error(
          `You’re trying to add more than what’s in stock (${product.quantity}). You can only add ${product.quantity} ${product.quantity === 1 ? "item" : "items"}!`
        );
      }

      if (quantity <= 0) {
        throw new Error("Quantity must be greater than 0!");
      }

      const cart = await CartModel.findOne({ user: req.user._id });

      if (cart) {
        const totalProductQuantityInCart = cart.cartItems
          .filter((item) => item.product.toString() === req.body.productId)
          .reduce((acc, item) => acc + item.quantity, 0);

        if (totalProductQuantityInCart + quantity > product.quantity) {
          throw new Error(
            `You’re trying to add more items than available in stock (${product.quantity}). You can only add ${Math.max(product.quantity - totalProductQuantityInCart, 0)} more ${product.quantity - totalProductQuantityInCart === 1 ? "item" : "items"} maximum.`
          );
        }
      }

      return true;
    }),
  validatorMiddleware
];

exports.getUserCartValidator = [
  check("user").custom(async (_userId, { req }) => {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      throw new Error(`No User Found For This ID: ${req.user._id}`);
    }

    if (user._id.toString() !== req.user._id.toString()) {
      throw new Error("User ID does not match the logged-in account!");
    }

    return true;
  }),
  validatorMiddleware
];

exports.updateCartQuantityValidator = [
  check("productId")
    .isMongoId()
    .withMessage("Invalid Product Id Format")
    .notEmpty()
    .withMessage("Product ID is Required!")
    .custom(async (productId, { req }) => {
      const cart = await CartModel.findOne({ user: req.user._id });

      if (!cart) {
        throw new Error(`No Cart Found For This User ID: ${req.user._id}`);
      }

      return true;
    }),
  check("itemId")
    .isMongoId()
    .withMessage("Invalid Item Id Format")
    .notEmpty()
    .withMessage("Item ID is Required!")
    .custom(async (itemId, { req }) => {
      const cart = await CartModel.findOne({ user: req.user._id });

      if (!cart) {
        throw new Error(`No Cart Found For This User ID: ${req.user._id}`);
      }

      if (!cart.cartItems.some((item) => item._id.toString() === itemId)) {
        throw new Error(`No Item Found For This ID: ${itemId}`);
      }

      return true;
    }),
  check("quantity")
    .notEmpty()
    .withMessage("Quantity is Required!")
    .isNumeric()
    .withMessage("Quantity must be a number!")
    .custom(async (quantity, { req }) => {
      const cart = await CartModel.findOne({ user: req.user._id });
      if (!cart) {
        throw new Error(`No Cart Found For This User ID: ${req.user._id}`);
      }

      const product = await ProductModel.findById(req.params.productId);
      if (!product) {
        throw new Error(
          `No Product Found For This ID: ${req.params.productId}`
        );
      }

      if (quantity <= 0) {
        throw new Error("Quantity must be greater than 0!");
      }

      if (cart.cartItems.length === 0) {
        throw new Error("Cart is Empty!");
      }

      const totalItemQuantityInCart = cart.cartItems
        .filter(
          (item) =>
            item.product.toString() === req.params.productId &&
            item._id.toString() !== req.body.itemId
        )
        .reduce((acc, item) => acc + item.quantity, 0);

      if (totalItemQuantityInCart + quantity > product.quantity) {
        throw new Error(
          `You're trying to set a quantity higher than the available stock (${product.quantity}). The maximum quantity you can set for this item is ${product.quantity - totalItemQuantityInCart === 0 ? product.quantity : product.quantity - totalItemQuantityInCart}.`
        );
      }

      return true;
    }),
  check("color")
    .trim()
    .notEmpty()
    .withMessage("Color is Required To Update The Quantity!")
    .isString()
    .withMessage("Color must be a string!")
    .custom(async (color, { req }) => {
      const product = await ProductModel.findById(req.params.productId);
      if (product.colors && product.colors.length) {
        if (
          !product.colors.some((c) => c.toLowerCase() === color.toLowerCase())
        ) {
          throw new Error(
            `Oops! The color '${color}' isn’t available for this product. You can choose from: ${product.colors.join(", ")}.`
          );
        }
      }

      const cart = await CartModel.findOne({ user: req.user._id });

      const matchedSizeAndColorAndItemId = cart.cartItems.find(
        (item) =>
          item.product.toString() === req.params.productId &&
          item.color.toLowerCase() === req.body.color.toLowerCase() &&
          item.size.toLowerCase() === req.body.size.toLowerCase() &&
          item._id.toString() === req.body.itemId
      );

      if (!matchedSizeAndColorAndItemId) {
        throw new Error(
          `No item found in the cart for this product ID: ${req.params.productId}, color: ${req.body.color}, and size: ${req.body.size}, item ID: ${req.body.itemId}.`
        );
      }

      return true;
    }),
  check("size")
    .trim()
    .notEmpty()
    .withMessage("Size is Required To Update The Quantity!")
    .isString()
    .withMessage("Size must be a string!")
    .custom(async (size, { req }) => {
      const product = await ProductModel.findById(req.params.productId);
      if (product.sizes && product.sizes.length) {
        if (
          !product.sizes.some((s) => s.toLowerCase() === size.toLowerCase())
        ) {
          throw new Error(
            `Oops! The size '${size}' isn’t available for this product. You can choose from: ${product.sizes.join(", ")}.`
          );
        }
      }

      return true;
    }),
  validatorMiddleware
];

exports.removeProductFromCartValidator = [
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

      const cart = await CartModel.findOne({ user: req.user._id });

      if (cart.cartItems.length === 0 || !cart) {
        throw new Error("Cart is Empty!");
      }

      if (
        !cart.cartItems.find((item) => item.product.toString() === productId)
      ) {
        throw new Error("Product Not Found In Your Cart!");
      }

      return true;
    }),

  check("itemId")
    .isMongoId()
    .withMessage("Invalid Item Id Format")
    .notEmpty()
    .withMessage("Item ID is Required!")
    .custom(async (itemId, { req }) => {
      const cart = await CartModel.findOne({ user: req.user._id });

      if (cart.cartItems.length === 0 || !cart) {
        throw new Error("Cart is Empty!");
      }

      const matchedItem = cart.cartItems.find(
        (item) => item._id.toString() === itemId
      );
      if (!matchedItem) {
        throw new Error(`No Item Found For This ID: ${itemId}`);
      }
    }),
  validatorMiddleware
];

exports.clearCartValidator = [
  check("userId")
    .optional()
    .custom(async (value, { req }) => {
      const user = await UserModel.findById(req.user._id);
      if (!user) {
        throw new Error(`No User Found For This ID: ${req.user._id}`);
      }

      const cart = await CartModel.findById(req.user._id);

      if (!cart) {
        throw new Error(`No Cart Found For This User ID: ${req.user._id}`);
      }

      if (cart.cartItems.length === 0 || !cart) {
        throw new Error("Cart is Empty!");
      }

      return true;
    }),
  validatorMiddleware
];

exports.applyCouponCodeValidator = [
  check("coupon")
    .notEmpty()
    .withMessage("Coupon is Required!")
    .isString()
    .withMessage("Coupon must be a string!")
    .custom(async (coupon, { req }) => {
      const couponFound = await CouponModel.findOne({
        coupon: { $regex: `^${coupon}$`, $options: "i" }
      });
      const user = await UserModel.findById(req.user._id);
      const cart = await CartModel.findOne({ user: req.user._id });

      if (cart.cartItems.length === 0 || !cart) {
        throw new Error("Cart is Empty!");
      }

      if (!user) {
        throw new Error(`No User Found For This ID: ${req.user._id}`);
      }

      if (!couponFound) {
        throw new Error("Coupon Not Found!");
      }

      if (couponFound.expireAt < new Date()) {
        throw new Error("Coupon Is Expired!");
      }

      if (
        cart.appliedCoupon &&
        cart.appliedCoupon.toLowerCase() === coupon.toLowerCase()
      ) {
        throw new Error("Coupon Already Applied!");
      }

      if (
        cart.appliedCoupon !== null &&
        cart.appliedCoupon !== "null" &&
        cart.appliedCoupon !== undefined
      ) {
        throw new Error("You Can Only Apply One Coupon At A Time!");
      }

      return true;
    }),
  validatorMiddleware
];
