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
    const orderPrice = cart.totalPriceAfterDiscount
      ? cart.totalPriceAfterDiscount
      : cart.totalPrice;

    const totalPriceAfterTaxAndShippingAdded = Number(
      orderPrice + taxPrice + shippingPrice
    ).toFixed(2);

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
      totalPriceAfterTaxAndShippingAdded,
      isPaid: false,
      paidAt: null,
      isDelivered: false,
      deliveredAt: null
    }).select("-__v");

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
