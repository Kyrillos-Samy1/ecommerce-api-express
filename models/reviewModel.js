const { default: mongoose } = require("mongoose");
const ProductModel = require("./productModel");

//! 1- Create Review Schema
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review is required!"],
      trim: true
    },
    rating: {
      type: Number,
      min: [1, "Rating Must Be At Least 1!"],
      max: [5, "Rating Must Be At Most 5!"],
      required: [true, "Rating is required!"]
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review Must Belong To A Product!"]
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review Must Belong To A User!"]
    }
  },
  { timestamps: true }
);

//! Aggregation Pipeline
reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      //! Get All Reviews Belong To Specific Product
      $match: { product: new mongoose.Types.ObjectId(productId) }
    },
    {
      //! Group By Product Id And Calculate Average Rating And Rating Quantity
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }
    }
  ]);

  const updateData =
    stats.length > 0
      ? {
          ratingsAverage: Math.round(stats[0].avgRating * 10) / 10,
          ratingsQuantity: stats[0].nRating
        }
      : { ratingsAverage: 0, ratingsQuantity: 0 };

  await ProductModel.findByIdAndUpdate(productId, updateData, {
    new: true,
    runValidators: false
  });
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatings(this.product);
});

reviewSchema.post(/^findOneAnd/, async (doc) => {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.product);
  }
});

//! To prevent duplicate reviews from the same user on the same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

//! 2- Create Review Model
module.exports = mongoose.model("Review", reviewSchema);
