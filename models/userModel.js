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
    slug: { type: String, lowercase: true },
    email: {
      type: String,
      required: [true, "User email is required!"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email!"]
    },
    userPhoto: {
      url: { type: String, trim: true },
      imagePublicId: { type: String, trim: true }
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
      select: false
    },
    passwordChangedAt: Date,
    //!----------------------------------------- EMAIL VERIFICATION
    emailVerificationCode: String,
    emailVerificationCodeExpires: Date,
    isEmailVerified: { type: Boolean, default: false },

    //!----------------------------------------- FORGOT PASSWORD
    resetPasswordCode: String,
    resetPasswordCodeExpires: Date,
    isForgotPasswordCodeVerified: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: true,
      select: false
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
        phone: String,
        details: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
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

//! Virtual for reviews count
userSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "user",
  localField: "_id"
});

//! Encrypt password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

//! Cascade delete on user delete
userSchema.pre("findOneAndDelete", async function (next) {
  try {
    const filter = this.getFilter();
    const userId = filter._id;
    if (!userId) return next();

    //! Get reviews + orders
    const [deletedReviews, userOrders] = await Promise.all([
      ReviewModel.find({ user: userId }),
      OrderModel.find({ user: userId })
    ]);

    //! Restore product quantities
    const productAdjustments = [];

    userOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        productAdjustments.push({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { quantity: item.quantity, sold: -item.quantity } }
          }
        });
      });
    });

    if (productAdjustments.length > 0) {
      await ProductModel.bulkWrite(productAdjustments);
    }

    await Promise.all([
      ReviewModel.deleteMany({ user: userId }),
      OrderModel.deleteMany({ user: userId }),
      CartModel.deleteMany({ user: userId })
    ]);

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

//! Create Model
const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
