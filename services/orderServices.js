const CartModel = require("../models/cartModel");
const OrderModel = require("../models/orderSchema");
const ProductModel = require("../models/productModel");
const UserModel = require("../models/userModel");
const APIError = require("../utils/apiError");
const {
  sendEmailNotification
} = require("../utils/emails/sendEmailNotification");
const orderDeliveredEmailTemplate = require("../utils/emails/templates/orderDeliveredEmailTemplate");
const orderConfirmationTemplate = require("../utils/emails/templates/orderEmailTemplate");
const { getAllDocuments } = require("./handlersFactory");

//! @desc Helper Function to Update Product Quantities & Clear Cart
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
      couponApplied: cart.appliedCoupon,
      couponDiscount: cart.appliedCouponDiscount,
      isPaid: false,
      paidAt: null,
      isDelivered: false,
      deliveredAt: null,
      isCancelled: false
    });

    //! 4) Update Product Quantities & Sold Count + Clear Cart
    await updateOrderQuantityAndClearCart(order, cart, req.user._id);

    //! 5) Send Email
    await sendEmailNotification(
      req,
      res,
      next,
      req.user.email,
      orderConfirmationTemplate(
        { userName: req.user.name, photo: req.user.userPhoto?.url },
        order,
        "Order Confirmation - FastCart Inc"
      ),
      "Order Confirmation - FastCart Inc",
      "Check Your Email For Order Created Successfully! Please proceed to pay at delivery time."
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
//! @access Private/Protected/Admin/Manager/User
exports.getLoggedUserOrders = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user._id);

    if (!user) {
      throw new Error("User Not Found!");
    }

    const orders = await OrderModel.find({ user: req.user._id }).sort(
      "-createdAt"
    );

    if (!orders) {
      throw new Error("Orders Not Found!");
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
//! @route GET /api/v1/orders/:orderId/order
//! @access Private/Protected/User
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

//! @desk Get All Orders With Pagination
//! @route GET /api/v1/orders/forAdmin
//! @access Private/Protected/Admin/Manager
exports.getAllOrdersForAdmin = getAllDocuments(
  OrderModel,
  "Orders",
  [],
  ["paymentMethodType", "isCancelled", "isPaid", "isDelivered"],
  "orderId"
);

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
    console.log("OrderId from params:", req.params.orderId);
    const order = await OrderModel.findById(req.params.orderId)
      .populate({
        path: "user",
        select: "name email userPhoto"
      })
      .select("-__v");
    console.log("Fetched order:", order);

    //! Send Email
    await sendEmailNotification(
      req,
      res,
      next,
      order.user.email,
      orderDeliveredEmailTemplate(
        {
          name: order.user.name,
          photo: order.user.userPhoto?.url,
          orderId: order._id
        },
        order.paymentMethodType,
        order.finalTotalPriceAfterTaxAndShippingAdded,
        "Order Delivery - FastCart Inc"
      ),
      "Order Delivery - FastCart Inc",
      "Order Mark Delivered Successfully! Check Your Email!"
    );

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
      taxPrice,
      shippingPrice,
      totalOrderPriceBeforeDiscount: cart.totalPrice,
      totalPriceAfterDiscount: cart.totalPriceAfterDiscount,
      totalPriceAfterCouponApplied: cart.totalPriceAfterCouponApplied || 0.0,
      couponApplied: cart.appliedCoupon,
      couponDiscount: cart.appliedCouponDiscount,
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
