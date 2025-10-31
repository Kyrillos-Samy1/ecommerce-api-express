const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const {
  applyImageUrlMiddleware
} = require("../middlewares/imageUrlBuilderMiddleware");

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

//! 2- Create User Model
const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
