const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const CartModel = require("../models/cartModel");
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
      message:
        "Order created successfully! Please proceed to pay at delivery time.",
      data: order
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//! @desk Get Logged User Orders
//! @route GET /api/v1/orders
//! @access Private/Protected/User/Admin/Manager
exports.getLoggedUserOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.find({ user: req.user._id }).sort(
      "-createdAt"
    );

    if (orders.length === 0) {
      return next(new APIError("No Orders Found!", 404, "NotFoundError"));
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
//! @access Private/Protected/User/Admin/Manager
exports.getSpecificOrder = async (req, res, next) => {
  try {
    const order = await OrderModel.findById(req.params.orderId);

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
//! @access Private/Protected/User/Admin
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await OrderModel.findById(req.params.orderId);

    order.isCancelled = true;
    await order.save();

    //! Restore stock & decrease sold count
    const operations = order.orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: {
            quantity: item.quantity,
            sold: -item.quantity
          }
        }
      }
    }));

    await ProductModel.bulkWrite(operations);

    res.status(200).json({
      status: "success",
      message: "Order cancelled successfully, stock restored & sales adjusted!",
      data: order
    });
  } catch (err) {
    console.error(err);
    next(new APIError(err.message, 500, err.name));
  }
};

//*====================================================== FOR ADMIN ======================================================

//! @desk Update Is Paid Status
//! @route PATCH /api/v1/orders/cash/:orderId/pay
//! @access Private/Protected/Admin/Manager
exports.updateOrderIsPaidStatus = async (req, res, next) => {
  try {
    const order = await OrderModel.findById(req.params.orderId).select("-__v");

    order.isPaid = true;
    order.paidAt = Date.now();
    await order.save();

    res.status(200).json({
      status: "success",
      message: "Order Payment Status Updated Successfully!",
      data: order
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//! @desk Update Is Delivred Status
//! @route PATCH /api/v1/orders/:orderId/deliver
//! @access Private/Protected/Admin/Manager
exports.updateOrderIsDeliveredStatus = async (req, res, next) => {
  try {
    const order = await OrderModel.findById(req.params.orderId).select("-__v");

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    await order.save();

    res.status(200).json({
      status: "success",
      message: "Order Delivery Status Updated Successfully!",
      data: order
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//*===================================== FOR WEBHOOK CHECKOUT - STRIPE INTEGRATION ===============================================

//! @desk Update Order Is Paid Status for Webhook Checkout
//! @route PATCH /api/v1/orders/webhook/:orderId/pay
//! @access Public/Webhook
exports.webhookCheckout = async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const order = await OrderModel.findById(session.client_reference_id);

      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentMethodType = "card";
      order.paymentResult = {
        id: session.payment_intent,
        status: session.payment_status,
        update_time: new Date().toISOString(),
        email_address: session.customer_details.email
      };

      await order.save();

      res.status(200).json({
        status: "success",
        message: "Order Payment Status Updated Successfully!",
        data: order
      });
    }
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//! @desc Create Card Order After Payment Success
//! @route POST /api/v1/orders/card/create-order
//! @access Private/Protected/User
exports.createCardOrder = (session) => async (req, res, next) => {
  try {
    //! Order Variables Depend on Admin

    const cartId = session.client_reference_id;
    const shippingAddress = session.metadata.shippingAddress;
    const totalPriceAfterTaxAndShippingPricesAdded = session.amount_total;
    const taxPrice = session.total_details.amount_tax;
    const shippingPrice = session.total_details.amount_shipping;

    //! 1) Get Cart Depand on CardId
    const cart = await CartModel.findById();
    //! 2) Create Order with paymentMethodType "card"
    const order = await OrderModel.create({
      user: session.metadata.userId,
      cart: cartId,
      orderItems: cart.cartItems,
      shippingAddress,
      paymentMethodType: "card",
      paymentResult: {
        id: session.payment_intent,
        status: session.payment_status,
        update_time: new Date().toISOString(),
        email_address: session.customer_details.email
      },
      itemsPrice: cart.totalPrice,
      taxPrice,
      shippingPrice,
      totalPriceAfterTaxAndShippingPricesAdded
    });

    res.status(200).json({
      status: "success",
      message: "Order Created Successfully!",
      data: order
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};
