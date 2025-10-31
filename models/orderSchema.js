const { default: mongoose } = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order Must Belong To A User!"]
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Order Item Must Belong To A Product!"]
        },
        quantity: {
          type: Number,
          required: [true, "Order Item Must Have A Quantity!"]
        },
        color: {
          type: String,
          required: [true, "Order Item Must Have A Color!"]
        },
        size: {
          type: String,
          required: [true, "Order Item Must Have A Size!"]
        },
        price: {
          type: Number,
          required: [true, "Order Item Must Have A Price!"]
        },
        priceAfterDiscount: {
          type: Number,
          required: [true, "Order Item Must Have A Price After Discount!"]
        }
      }
    ],
    shippingAddress: {
      fullName: {
        type: String,
        required: [true, "Order Must Have A Full Name!"]
      },
      address: {
        type: String,
        required: [true, "Order Must Have An Address!"]
      },
      city: {
        type: String,
        required: [true, "Order Must Have A City!"]
      },
      postalCode: {
        type: String,
        required: [true, "Order Must Have A Postal Code!"]
      },
      country: {
        type: String,
        required: [true, "Order Must Have A Country!"]
      },
      phone: {
        type: String,
        required: [true, "Order Must Have A Phone Number!"]
      }
    },
    paymentMethodType: {
      type: String,
      enum: ["cash", "card"],
      required: [true, "Order Must Have A Payment Method Type!"],
      default: "cash"
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String
    },
    taxPrice: {
      type: Number,
      required: [true, "Order Must Have A Tax Price!"],
      default: 0.0
    },
    shippingPrice: {
      type: Number,
      required: [true, "Order Must Have A Shipping Price!"],
      default: 0.0
    },
    totalPriceAfterDiscount: {
      type: Number,
      required: [true, "Order Must Have A Total Price After Discount!"],
      default: 0.0
    },
    totalOrderPrice: {
      type: Number,
      required: [true, "Order Must Have A Total Price!"],
      default: 0.0
    },
    isPaid: {
      type: Boolean,
      required: [true, "Order Must Have A Payment Status!"],
      default: false
    },
    paidAt: {
      type: Date
    },
    isDelivered: {
      type: Boolean,
      required: [true, "Order Must Have A Delivery Status!"],
      default: false
    },
    deliveredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;
