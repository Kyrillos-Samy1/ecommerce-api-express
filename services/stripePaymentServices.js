const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const CartModel = require("../models/cartModel");
const APIError = require("../utils/apiError");
const { sendOrderConfirmationEmail } = require("../utils/emails/ordersEmail");
const orderConfirmationTemplate = require("../utils/emails/templates/cashOrderEmailTemplate");
const { createCardOrder } = require("./orderServices");

//! @desc Get Checkout Session From Stripe and Send it as a Response
//! @route POST /api/v1/stripe/checkout-session/:cartId
//! @access Private/Protected/User
exports.checkoutSession = async (req, res, next) => {
  try {
    //! Order Variables Depend on Admin
    const shippingPrice = 10;
    const taxPrice = 0; //! Tax will be calculated automatically by Stripe based on customer location

    //! 1) Get Cart Depand on CartId
    const cart = await CartModel.findById(req.params.cartId);

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
            images: [item.imageCover.url || item.images[0].url]
          },
          unit_amount: Math.round(
            (item.priceAfterDiscount && item.priceAfterDiscount > 0
              ? item.priceAfterDiscount
              : item.price) * 100
          )
        },
        quantity: item.quantity
      }))

      // //! Apply Tax if exists
      // ...(taxPrice > 0
      //   ? [
      //       {
      //         price_data: {
      //           currency: "usd",
      //           product_data: {
      //             name: "Tax",
      //             description: "Applied VAT or sales tax"
      //           },
      //           unit_amount: Math.round(taxPrice * 100)
      //         },
      //         quantity: 1
      //       }
      //     ]
      //   : [])
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

      automatic_tax: { enabled: true }, //! Enable Automatic Tax Based on Customer Location

      metadata: {
        cartId: req.params.cartId.toString(),
        userId: req.user._id.toString(),
        userPhoto: req.user.userPhoto?.url,
        userName: req.user.name,
        finalTotalPrice,
        taxPrice,
        shippingPrice,
        discountAmount,
        shippingAddress: JSON.stringify({
          FullName: req.user.name,
          Address: req.user.addresses?.[0]?.details || "N/A",
          City: req.user.addresses?.[0]?.city || "N/A",
          PostalCode: req.user.addresses?.[0]?.zipCode || "N/A",
          Country: req.user.addresses?.[0]?.country || "N/A",
          Phone: req.user.addresses?.[0]?.phone || req.user.phone || "N/A"
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

      phone_number_collection: {
        enabled: true
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

    res.status(200).json({
      status: "success",
      message: "Checkout Session Created Successfully!",
      data: session
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//! @desc Stripe Webhook Checkout to handle post-payment actions
//! @route POST /webhook-checkout
//! @access Public
exports.webhookCheckout = async (req, res, next) => {
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

    try {
      const order = await createCardOrder(session, next);

      await sendOrderConfirmationEmail(
        session.customer_details.email,
        orderConfirmationTemplate(
          {
            userName: session.metadata.userName,
            userPhoto: session.metadata.userPhoto
          },
          order
        ),
        "Order Confirmation - FastCart Inc"
      );

      console.log("Order confirmation email sent successfully!");
    } catch (err) {
      console.error("Error in sending confirmation email:", err.message);
    }
  }
  res.status(200).json({ received: true });
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
