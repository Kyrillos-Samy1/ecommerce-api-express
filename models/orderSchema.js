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
        title: {
          type: String,
          required: [true, "Order Item Must Have A Title!"]
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
          type: Number
        },
        images: {
          type: [{ url: String, imagePublicId: String }],
          required: [true, "Order Item Must Have Images!"]
        },
        imageCover: {
          type: { url: String, imagePublicId: String },
          required: [true, "Order Item Must Have A Cover Image!"]
        }
      }
    ],
    shippingAddress: {
      fullName: {
        type: String,
        trim: true,
        minLength: [3, "Full Name Must Be At Least 3 Characters Long!"],
        maxLength: [100, "Full Name Must Be Less Than 100 Characters!"],
        required: [true, "Order Must Have A Full Name!"]
      },
      address: {
        type: String,
        trim: true,
        minLength: [3, "Address Must Be At Least 3 Characters Long!"],
        maxLength: [200, "Address Must Be Less Than 200 Characters!"],
        required: [true, "Order Must Have An Address!"]
      },
      city: {
        type: String,
        trim: true,
        minLength: [2, "City Must Be At Least 2 Characters Long!"],
        maxLength: [100, "City Must Be Less Than 100 Characters!"],
        required: [true, "Order Must Have A City!"]
      },
      postalCode: {
        type: String,
        trim: true,
        minLength: [5, "Postal Code Must Be 5 Characters Long!"],
        maxLength: [5, "Postal Code Must Be 5 Characters Long!"],
        required: [true, "Order Must Have A Postal Code!"]
      },
      country: {
        type: String,
        trim: true,
        minLength: [2, "Country Must Be At Least 2 Characters Long!"],
        maxLength: [100, "Country Must Be Less Than 100 Characters!"],
        required: [true, "Order Must Have A Country!"]
      },
      phone: {
        type: String,
        trim: true,
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
    totalOrderPriceBeforeDiscount: {
      type: Number,
      required: [true, "Order Must Have A Total Price Before Discount!"],
      default: 0.0
    },
    totalPriceAfterDiscount: {
      type: Number,
      default: 0.0
    },
    totalPriceAfterCouponApplied: {
      type: Number,
      required: [true, "Order Must Have A Total Price After Coupon Applied!"],
      default: 0.0
    },
    couponApplied: {
      type: String
    },
    finalTotalPriceAfterTaxAndShippingAdded: {
      type: Number,
      required: [
        true,
        "Order Must Have A Total Price After Tax And Shipping Added!"
      ],
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
    },
    isCancelled: {
      type: Boolean,
      required: [true, "Order Must Have A Cancellation Status!"],
      default: false
    }
  },
  {
    timestamps: true
  }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email phone userPhoto"
  }).populate({
    path: "orderItems.product",
    select: "title slug imageCover"
  });
  next();
});

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;
