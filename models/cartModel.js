const { default: mongoose } = require("mongoose");

//! 1- Create Cart Schema
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cart Must Belong To A User!"]
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Cart Item Must Belong To A Product!"]
        },
        title: {
          type: String,
          required: [true, "Cart Item Must Have A Title!"]
        },
        quantity: {
          type: Number,
          required: [true, "Cart Item Must Have A Quantity!"],
          default: 1
        },
        color: {
          type: String,
          required: [true, "Cart Item Must Have A Color!"]
        },
        size: {
          type: String,
          required: [true, "Cart Item Must Have A Size!"]
        },
        price: {
          type: Number,
          required: [true, "Cart Item Must Have A Price!"]
        },
        priceAfterDiscount: {
          type: Number,
          required: [true, "Cart Item Must Have A Discounted Price!"]
        },
        images: {
          type: [{ url: String, imagePublicId: String }],
          required: [true, "Cart Item Must Have Images!"]
        },
        imageCover: {
          type: { url: String, imagePublicId: String },
          required: [true, "Cart Item Must Have A Cover Image!"]
        }
      }
    ],
    totalPrice: {
      type: Number,
      required: [true, "Cart Must Have A Total Price!"]
    },
    totalPriceAfterDiscount: {
      type: Number,
      required: [true, "Cart Must Have A Discounted Total Price!"]
    },
    totalPriceAfterCouponApplied: {
      type: Number
    },
    totalItems: {
      type: Number,
      required: [true, "Cart Must Have A Total Items!"]
    },
    appliedCoupon: {
      type: String,
      default: null
    },
    appliedCouponDiscount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

//! 2- Create Cart Model
const CartModel = mongoose.model("Cart", cartSchema);

module.exports = CartModel;
