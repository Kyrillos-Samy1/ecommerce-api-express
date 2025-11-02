const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const {
  applyImageUrlMiddleware
} = require("../middlewares/imageUrlBuilderMiddleware");
const ReviewModel = require("./reviewModel");
const OrderModel = require("./orderSchema");
const ProductModel = require("./productModel");

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
    userPhoto: String,
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
        id: { type: mongoose.Schema.Types.ObjectId },
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

//! Add image URL to the userPhoto field
applyImageUrlMiddleware(userSchema, "users");

//! Encrypt user password using bcryptjs
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

//! Cascade delete for user-related data on user deletion (e.g., reviews, orders)
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
      order.cartItems.forEach((item) => {
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
      OrderModel.deleteMany({ user: userId })
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

    console.log(`Cascade delete completed for user: ${userId}`);
    next();
  } catch (err) {
    console.error("Error during user cascade delete:", err);
    next();
  }
});

//! 2- Create User Model
const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
