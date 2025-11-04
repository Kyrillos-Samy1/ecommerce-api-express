const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const CartModel = require("../models/cartModel");
const OrderModel = require("../models/orderSchema");
const APIError = require("../utils/apiError");

//! @desc Get Checkout Session From Stripe and Send it as a Response
//! @route POST /api/v1/stripe/checkout/:cartId
//! @access Private/Protected/User
exports.checkoutSession = async (req, res, next) => {
  try {
    //! 0) Get Order to retrieve shipping address
    const order = await OrderModel.findOne({ user: req.user._id });

    const { fullName, address, city, postalCode, country, phone } =
      order.shippingAddress;

    //! Order Variables Depend on Admin
    const shippingPrice = 10;
    const taxPrice = 20;

    //! 1) Get Cart Depand on CartId
    const cart = await CartModel.findById(req.params.cartId);

    if (!cart || cart.cartItems.length === 0) {
      return next(new APIError("Cart not found!", 404, "NotFoundError"));
    }

    //! 2) Create Stripe Checkout Session

    //! A) Get subtotal
    const totalWithoutDiscount = cart.cartItems.reduce(
      (sum, item) =>
        sum +
        (item.priceAfterDiscount && item.priceAfterDiscount > 0
          ? item.priceAfterDiscount
          : item.price) *
          item.quantity,
      0
    );

    //! B) Get discount
    const discountAmount =
      cart.totalPriceAfterCouponApplied && cart.totalPriceAfterCouponApplied > 0
        ? totalWithoutDiscount - cart.totalPriceAfterCouponApplied
        : 0;

    //! C) Apply tax and shipping correctly
    const subtotalAfterDiscount = totalWithoutDiscount - discountAmount;
    const finalTotalPrice = subtotalAfterDiscount + taxPrice + shippingPrice;

    //! D) Create Stripe Line Items
    const lineItems = [
      ...cart.cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title || "Product",
            description: `Color: ${item.color || "N/A"} | Size: ${item.size || "N/A"}`,
            images: [
              "https://assets-dubaiphone.dubaiphone.net/dp-prod/wp-content/uploads/2025/05/ASUS-ROG-Strix-SCAR-16-G635LX-AI264W-768x768.webp"
            ]
          },
          unit_amount: Math.round(
            (item.priceAfterDiscount && item.priceAfterDiscount > 0
              ? item.priceAfterDiscount
              : item.price) * 100
          )
        },
        quantity: item.quantity
      })),

      //! Apply Tax if exists
      ...(taxPrice > 0
        ? [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "Tax",
                  description: "Applied VAT or sales tax"
                },
                unit_amount: Math.round(taxPrice * 100)
              },
              quantity: 1
            }
          ]
        : [])
    ];

    let discounts = [];

    //! Apply Coupon Discount if exists
    if (discountAmount > 0) {
      const coupon = await stripe.coupons.create({
        name: `Discount Coupon - ${cart.appliedCoupon || "N/A"}`,
        amount_off: Math.round(discountAmount * 100),
        currency: "usd",
        duration: "once"
      });

      discounts = [{ coupon: coupon.id }];
    }

    //! E) Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,

      discounts,

      metadata: {
        cartId: req.params.cartId,
        finalTotalPrice,
        taxPrice,
        shippingPrice,
        discountAmount,
        shippingAddress: JSON.stringify({
          FullName: fullName,
          Address: address,
          City: city,
          PostalCode: postalCode,
          Country: country,
          Phone: phone
        })
      },

      customer_email: req.user.email,
      client_reference_id: req.params.cartId,

      success_url: `${req.protocol}://${req.get("host")}/api/v1/stripe/online/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get("host")}/api/v1/stripe/online/cancel`,

      shipping_address_collection: {
        allowed_countries: [
          "US",
          "EG",
          "AE",
          "GB",
          "FR",
          "CA",
          "MX",
          "IN",
          "TR",
          "SA",
          "JO",
          "KW",
          "BH",
          "QA"
        ]
      },

      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: Math.round(shippingPrice * 100),
              currency: "usd"
            },
            display_name: "Standard Shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 5 }
            }
          }
        }
      ]
    });

    //! 5) Clear Cart Depand on CardId
    // await CartModel.findByIdAndUpdate(
    //   req.params.cardId,
    //   {
    //     $set: {
    //      cartItems: [],
    //       totalPrice: 0,
    //       totalPriceAfterDiscount: 0,
    //       appliedCoupon: null,
    //       appliedCouponDiscount: 0,
    //       totalPriceAfterCouponApplied: 0,
    //       totalItems: 0
    //     }
    //   },
    //   { new: true, runValidators: true }
    // );

    res.status(200).json({
      status: "success",
      message: "Checkout Session Created Successfully!",
      data: session
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//! @desc Get Checkout Session From Stripe and Send it as a Response
//! @route POST /api/v1/stripe/online/success
//! @access Private/Protected/User
exports.checkoutSessionSuccess = async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Checkout Session Success!"
  });
};

//! @desc Get Checkout Session From Stripe and Send it as a Response
//! @route POST /api/v1/stripe/online/cancel
//! @access Private/Protected/User
exports.checkoutSessionCancel = async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Checkout Session Cancelled!"
  });
};
