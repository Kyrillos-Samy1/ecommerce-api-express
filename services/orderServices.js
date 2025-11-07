const CartModel = require("../models/cartModel");
const OrderModel = require("../models/orderSchema");
const ProductModel = require("../models/productModel");
const APIError = require("../utils/apiError");

//! @ desc Helper Function to Update Product Quantities & Clear Cart
const updateOrderQuantityAndClearCart = async (order, cart, userId) => {
  //! 4) Update Product Quantities
  if (order) {
    const operations = cart.cartItems.map((item) => ({
      // await Promise.all(
      //   cart.cartItems.map(async (item) => {
      //     await ProductModel.findByIdAndUpdate(item.product, {
      //       $inc: { quantity: -item.quantity, sold: item.quantity }
      //     });
      //   })
      // );

      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: { quantity: -item.quantity, sold: item.quantity }
        }
      }
    }));
    await ProductModel.bulkWrite(operations);
  }

  //! 5) Clear Cart
  await CartModel.findOneAndUpdate(
    { user: userId },
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
};

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
      paymentResult: {
        id: null,
        status: "Pending",
        update_time: null,
        email_address: null
      },
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

    //! 4) Update Product Quantities & Sold Count + Clear Cart
    await updateOrderQuantityAndClearCart(order, cart, req.user._id);

    //! 5) Send Response
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
    order.paymentResult.status = "Cancelled";
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
    order.paymentResult.status = "Paid";
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

//*==================================================== FOR STRIPE WEBHOOK ===============================================

//! @desc Create Card Order after Successful Payment via Stripe Webhook
//! @route POST /webhook-checkout
//! @access Public
exports.createCardOrder = async (session, next) => {
  try {
    //! 1) Define Order Data from Session Object
    const cartId = session.client_reference_id;
    const { country, line1, line2, city, state } =
      session.customer_details.address;
    const postalCode = session.customer_details.address.postal_code;
    const finalTotalPriceAfterTaxAndShippingAdded = session.amount_total / 100;
    const taxPrice = session.total_details.amount_tax / 100;
    const shippingPrice = session.total_details.amount_shipping / 100;

    const phone = session.customer_details.phone;
    const fullName = session.customer_details.name;

    const userId = session.metadata.userId;

    const shippingAddress = {
      fullName,
      address: `${line1}${line2 ? `, ${line2}` : ""}`,
      city: city || state,
      country,
      postalCode,
      phone
    };

    //! 2) Get Cart Data Depand on CartId
    const cart = await CartModel.findById(cartId);

    //! 3) Create Order with paymentMethodType "card" and paymentResult from Session Object
    const order = await OrderModel.create({
      user: userId,
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
      totalOrderPriceBeforeDiscount: cart.totalPrice,
      totalPriceAfterDiscount: cart.totalPriceAfterDiscount,
      totalPriceAfterCouponApplied: cart.totalPriceAfterCouponApplied || 0.0,
      finalTotalPriceAfterTaxAndShippingAdded,
      isPaid: true,
      paidAt: Date.now(),
      isDelivered: false,
      deliveredAt: null,
      isCancelled: false
    });

    //! 4) Update Product Quantities & Sold Count + Clear Cart
    await updateOrderQuantityAndClearCart(order, cart, userId);
    
    //! 5) Return Order
    return order;
  } catch (err) {
    if (next) next(new APIError(err.message, 500, err.name));
    else throw err;
  }
};
