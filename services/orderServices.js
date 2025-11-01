const CartModel = require("../models/cartSchema");
const OrderModel = require("../models/orderSchema");
const ProductModel = require("../models/productModel");
const APIError = require("../utils/apiError");

//! @desc Create CashOrder
//! @route POST /api/v1/orders/cash/:cardId
//! @access Private/Protected/User
exports.createCashOrder = async (req, res, next) => {
  try {
    //! Order Variables Depend on Admin
    const taxPrice = 20;
    const shippingPrice = 10;

    //! 1) Get Cart Depand on CardId
    const cart = await CartModel.findById(req.params.cardId);

    //! 2) Get Order Price Depend on Cart Price "Check If Coupon Applied?"
    let orderPrice;
    if (
      cart.totalPriceAfterCouponApplied != null &&
      cart.totalPriceAfterCouponApplied !== 0
    ) {
      orderPrice = cart.totalPriceAfterCouponApplied;
    } else if (
      cart.totalPriceAfterDiscount != null &&
      cart.totalPriceAfterDiscount !== 0
    ) {
      orderPrice = cart.totalPriceAfterDiscount;
    } else {
      orderPrice = cart.totalPrice;
    }

    const finalTotalPriceAfterTaxAndShippingAdded = Number(
      (Number(orderPrice) + Number(taxPrice) + Number(shippingPrice)).toFixed(2)
    );

    //! 3) Create Order with default paymentMethodType "cash"
    const order = await OrderModel.create({
      user: req.user._id,
      orderItems: cart.cartItems,
      shippingAddress: req.body.shippingAddress,
      paymentMethodType: "cash",
      taxPrice,
      shippingPrice,
      totalOrderPriceBeforeDiscount: cart.totalPrice,
      totalPriceAfterDiscount: cart.totalPriceAfterDiscount,
      totalPriceAfterCouponApplied: cart.totalPriceAfterCouponApplied || 0.0,
      finalTotalPriceAfterTaxAndShippingAdded,
      isPaid: false,
      paidAt: null,
      isDelivered: false,
      deliveredAt: null,
      isCancelled: false
    });

    //! 4) After Creating Order, Decrement Product Quantity, Incerement Sold Quantity
    if (order) {
      // await Promise.all(
      //   cart.cartItems.map(async (item) => {
      //     await ProductModel.findByIdAndUpdate(item.product, {
      //       $inc: { quantity: -item.quantity, sold: item.quantity }
      //     });
      //   })
      // );

      const operations = cart.cartItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, sold: item.quantity } }
        }
      }));

      await ProductModel.bulkWrite(operations, {});
    }

    //! 5) Clear Cart Depand on CardId
    await CartModel.findOneAndUpdate(
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
    );

    //! 6) Send Response
    res.status(201).json({
      status: "success",
      message: "Order created successfully",
      data: order
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//! @desk Get Logged User Orders
//! @route GET /api/v1/orders
//! @access Private/Protected/User
exports.getLoggedUserOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.find({ user: req.user._id }).sort(
      "-createdAt"
    );

    if (orders.length === 0) {
      return next(new APIError("No Orders Found", 404, "NotFoundError"));
    }

    res.status(200).json({
      status: "success",
      message: "Orders Found Successfully!",
      data: orders
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//! @desk Get Specific Order
//! @route GET /api/v1/orders/:orderId
//! @access Private/Protected/User
exports.getSpecificOrder = async (req, res, next) => {
  try {
    const order = await OrderModel.findById(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Order Found Successfully!",
      data: order
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//! @desk Cancel Order
//! @route PUT /api/v1/orders/:orderId
//! @access Private/Protected/User
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await OrderModel.findByIdAndUpdate(req.params.id, {
      isCancelled: true
    });

    res.status(200).json({
      status: "success",
      message: "Order Cancelled Successfully!",
      data: order
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};
