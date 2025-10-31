const { default: mongoose } = require("mongoose");

//! 1- Create Coupon Schema
const couponSchema = new mongoose.Schema(
  {
    coupon: {
      type: String,
      trim: true,
      uppercase: true,
      required: [true, "Coupon Name is Required!"],
      unique: [true, "Coupon Must Be Unique!"],
      minLength: [2, "Too Short Coupon Name!"],
      maxLength: [32, "Too Long Coupon Name!"]
    },
    discount: {
      type: Number,
      min: [1, "Discount Must Be At Least 1!"],
      max: [100, "Discount Must Be At Most 100!"],
      required: [true, "Discount is required!"]
    },
    expireAt: {
      type: Date,
      required: [true, "Expire Date is required!"]
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false
  }
);

//! Virtuals Methods
couponSchema.virtual("discountPercent").get(function () {
  return `${this.discount}% OFF`;
});

couponSchema.virtual("expireDate").get(function () {
  return new Date(this.expireAt).toLocaleDateString();
});

couponSchema.virtual("expireTime").get(function () {
  return new Date(this.expireAt).toLocaleTimeString();
});

couponSchema.virtual("leftTime").get(function () {
  const now = new Date();
  let timeLeft = this.expireAt - now;

  if (timeLeft <= 0) return "Coupon Expired";

  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  timeLeft %= 1000 * 60 * 60 * 24;

  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  timeLeft %= 1000 * 60 * 60;

  const minutesLeft = Math.floor(timeLeft / (1000 * 60));
  timeLeft %= 1000 * 60;

  const secondsLeft = Math.floor(timeLeft / 1000);

  return `Coupon Will Expire in: ${daysLeft}d ${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`;
});

//! 2- Create Coupon Model
const CouponModel = mongoose.model("Coupon", couponSchema);

module.exports = CouponModel;
