const CartModel = require("../models/cartModel");
const CouponModel = require("../models/couponModel");
const ProductModel = require("../models/productModel");
const APIError = require("../utils/apiError");

//! @desc Update Cart After Adding Product
const updateCartAfterAddingProduct = async (cart) => {
  cart.totalItems = cart.cartItems.length;

  cart.totalPrice = cart.cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  cart.totalPriceAfterDiscount = cart.cartItems.reduce(
    (acc, item) =>
      acc +
      Number(
        item.priceAfterDiscount && !Number.isNaN(item.priceAfterDiscount)
          ? item.priceAfterDiscount
          : item.price
      ) *
        Number(item.quantity || 0),
    0
  );

  if (cart.appliedCoupon && cart.appliedCouponDiscount) {
    const discountPercent = Number(cart.appliedCouponDiscount);
    const priceBeforeDiscount = Number(cart.totalPriceAfterDiscount)
      ? Number(cart.totalPriceAfterDiscount)
      : Number(cart.totalPrice);
    const appliedCouponDiscount = (priceBeforeDiscount * discountPercent) / 100;
    cart.totalPriceAfterCouponApplied = Number(
      Number((priceBeforeDiscount - appliedCouponDiscount).toFixed(2))
    );
  }
};

//! @desc Add Product To Cart
//! @route POST /api/v1/cart
//! @access Protected/User
exports.addProductToCart = async (req, res, next) => {
  try {
    const { productId, color, size } = req.body;

    const product = await ProductModel.findById(productId);

    const quantity = Number(req.body.quantity) || 1;

    const price = Number(product.price);

    const discountPrice = Number(product.priceAfterDiscount);

    let cart = await CartModel.findOne({ user: req.user._id });

    if (!cart) {
      const totalPrice = price * quantity;

      const itemPriceAfterDiscount = !Number.isNaN(discountPrice)
        ? discountPrice
        : price;

      cart = await CartModel.create({
        user: req.user._id,
        cartItems: [
          {
            title: product.title,
            product: productId,
            quantity,
            color,
            size,
            price,
            priceAfterDiscount: discountPrice,
            images: product.images,
            imageCover: product.imageCover
          }
        ],
        totalQuantity: quantity,
        totalItems: 1,
        totalPrice,
        totalPriceAfterDiscount: itemPriceAfterDiscount
      });
    } else {
      const index = cart.cartItems.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.color.toLowerCase() === color.toLowerCase() &&
          item.size.toLowerCase() === size.toLowerCase()
      );

      if (index > -1) {
        cart.cartItems[index].quantity += quantity;
      } else {
        cart.cartItems.push({
          product: productId,
          title: product.title,
          quantity,
          color,
          size,
          price,
          priceAfterDiscount: discountPrice,
          images: product.images,
          imageCover: product.imageCover
        });
      }

      updateCartAfterAddingProduct(cart);

      await cart.save();
    }

    res.status(201).json({
      status: "success",
      message: "Product added to cart successfully",
      data: cart
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//! @desc Get User Cart
//! @route GET /api/v1/cart
//! @access Protected/User
exports.getUserCart = async (req, res, next) => {
  try {
    const cart = await CartModel.findOne({ user: req.user._id })
      .select("-__v")
      .populate({
        path: "cartItems.product",
        select: "-__v"
      });

    if (!cart) {
      return next(new APIError("Cart not found!", 404, "NotFoundError"));
    }

    if (cart.cartItems.length === 0) {
      return next(new APIError("Cart is empty!", 404, "NotFoundError"));
    }

    await updateCartAfterAddingProduct(cart);

    await cart.save();

    res.status(200).json({
      message: "Cart Fetched Successfully!",
      results: cart.cartItems.length,
      userCart: cart
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//! @desc Remove Product From Cart
//! @route DELETE /api/v1/cart/:productId
//! @access Protected/User
exports.removeProductFromCart = async (req, res, next) => {
  try {
    const cart = await CartModel.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { cartItems: { _id: req.body.itemId } } },
      { new: true, runValidators: true }
    ).select("-__v");

    updateCartAfterAddingProduct(cart);

    if (cart.cartItems.length === 0) {
      cart.appliedCouponDiscount = 0;
      cart.appliedCoupon = null;
      cart.totalPriceAfterCouponApplied = 0;
    }

    await cart.save();

    res.status(200).json({
      message: "Product deleted from cart!",
      results: cart.cartItems.length,
      userCart: cart
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//! @desc Update Cart Quantity
//! @route PATCH /api/v1/cart/:productId
//! @access Protected/User
exports.updateCartQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    const cart = await CartModel.findOneAndUpdate(
      {
        user: req.user._id,
        "cartItems.product": req.params.productId,
        "cartItems.color": req.body.color,
        "cartItems.size": req.body.size,
        "cartItems._id": req.body.itemId
      },
      { $set: { "cartItems.$.quantity": quantity } },
      { new: true, runValidators: true }
    ).select("-__v");

    updateCartAfterAddingProduct(cart);

    await cart.save();

    res.status(200).json({
      message: "Product quantity updated successfully!",
      results: cart.cartItems.length,
      userCart: cart
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//! @desc Clear Cart
//! @route DELETE /api/v1/cart/clear
//! @access Protected/User
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await CartModel.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          cartItems: [],
          totalPrice: 0,
          totalPriceAfterDiscount: 0,
          appliedCoupon: null,
          appliedCouponDiscount: 0,
          totalPriceAfterCouponApplied: 0,
          totalItems: 0
        }
      },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!cart) {
      return next(new APIError("Cart not found!", 404, "NotFoundError"));
    }

    res.status(200).json({
      message: "Cart cleared successfully!",
      userCart: cart
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//! @desk Apply Coupon
//! @route POST /api/v1/cart/apply-coupon
//! @access Protected/User
exports.applyCouponCode = async (req, res, next) => {
  try {
    const { coupon } = req.body;

    const cart = await CartModel.findOne({ user: req.user._id }).select("-__v");

    const couponFound = await CouponModel.findOne({
      coupon: { $regex: `^${coupon}$`, $options: "i" }
    }).select("-__v");

    const discountPercent = Number(couponFound.discount);

    const priceBeforeCouponApplied =
      Number(cart.totalPriceAfterDiscount) || Number(cart.totalPrice);

    const appliedCouponDiscount =
      (priceBeforeCouponApplied * discountPercent) / 100;

    cart.totalPriceAfterCouponApplied = Number(
      (priceBeforeCouponApplied - appliedCouponDiscount).toFixed(2)
    );

    cart.appliedCoupon = couponFound.coupon;
    cart.appliedCouponDiscount = couponFound.discount;

    await cart.save();

    res.status(200).json({
      message: "Coupon applied successfully!",
      discountPercent,
      appliedCouponDiscount,
      userCart: cart
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};
