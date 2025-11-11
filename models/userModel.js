const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const ReviewModel = require("./reviewModel");
const OrderModel = require("./orderSchema");
const ProductModel = require("./productModel");
const CartModel = require("./cartModel");

//! 1- Create User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required!"],
      trim: true,
      minlength: [3, "Too short user name!"],
      maxlength: [32, "Too long user name!"]
    },
    slug: {
      type: String,
      lowercase: true
    },
    email: {
      type: String,
      required: [true, "User email is required!"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email!"]
    },
    userPhoto: {
      url: {
        type: String,
        trim: true,
        required: [true, "User photo url is required!"]
      },
      imagePublicId: {
        type: String,
        trim: true,
        required: [true, "User photo public id is required!"]
      }
    },
    phone: String,
    role: {
      type: String,
      enum: ["user", "admin", "manager"],
      default: "user"
    },
    password: {
      type: String,
      required: [true, "User password is required!"],
      minlength: [6, "Too short password!"],
      select: false //! to not show the password in any output
    },
    passwordChangedAt: Date,
    resetCode: String,
    resetCodeExpires: Date,
    resetCodeVerified: Boolean,
    active: {
      type: Boolean,
      default: true,
      select: false //! to not show the active field in any output
    },
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product"
      }
    ],
    addresses: [
      {
        addressType: {
          type: String,
          enum: ["home", "office", "work", "billing", "shipping", "other"],
          default: "home"
        },
        phone: { type: String },
        details: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false
  }
);

//! Virtual Fields for reviews count
userSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "user",
  localField: "_id"
});

//! Encrypt user password using bcryptjs
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

//! Implement cascade delete for user-related data and enhance order cancellation logic with stock restoration
userSchema.pre("findOneAndDelete", async function (next) {
  try {
    const filter = this.getFilter();
    const userId = filter._id;

    if (!userId) return next();

    //! Get affected reviews & orders before deletion
    const [deletedReviews, userOrders] = await Promise.all([
      ReviewModel.find({ user: userId }),
      OrderModel.find({ user: userId })
    ]);

    //! Restore stock & adjust sold counts
    const productAdjustments = [];

    userOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        productAdjustments.push({
          updateOne: {
            filter: { _id: item.product },
            update: {
              $inc: {
                quantity: item.quantity,
                sold: -item.quantity
              }
            }
          }
        });
      });
    });

    if (productAdjustments.length > 0) {
      await ProductModel.bulkWrite(productAdjustments);
    }

    //! Delete reviews & orders concurrently
    await Promise.all([
      ReviewModel.deleteMany({ user: userId }),
      OrderModel.deleteMany({ user: userId }),
      CartModel.deleteMany({ user: userId })
    ]);

    //! Recalculate ratings for affected products
    const productIds = [
      ...new Set(deletedReviews.map((review) => review.product.toString()))
    ];

    if (productIds.length > 0) {
      await Promise.all(
        productIds.map((productId) => ReviewModel.calcAverageRatings(productId))
      );
    }

    next();
  } catch (err) {
    console.error("Error during user cascade delete:", err);
    next();
  }
});

//! 2- Create User Model
const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
