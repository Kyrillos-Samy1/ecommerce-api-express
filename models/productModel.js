const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product Title is Required!"],
      trim: true,
      unique: true,
      minLenth: [3, "Product Title Must Be At Least 3 Characters Long!"],
      maxLength: [100, "Product Title Must Be Less Than 100 Characters!"]
    },
    slug: {
      type: String,
      required: [true, "Product Slug is Required!"],
      trim: true,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, "Product Description is Required!"],
      trim: true,
      minLength: [
        20,
        "Product Description Must Be At Least 20 Characters Long!"
      ],
      maxLength: [500, "Product Description Must Be Less Than 500 Characters!"]
    },
    quantity: {
      type: Number,
      required: [true, "Product Quantity is Required!"]
    },
    sold: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, "Product Price is Required!"],
      trim: true,
      min: [100, "Product Price Must Be Greater Than 100!"],
      max: [2000000, "Product Price Must Be Less Than 2000000!"]
    },
    priceAfterDiscount: {
      type: Number
    },
    colors: [String],
    sizes: [String],
    imageCover: {
      url: {
        type: String,
        required: [true, "Product Image Cover Url is Required!"],
        default: "https://via.placeholder.com/150",
        trim: true
      },
      imagePublicId: {
        type: String,
        trim: true,
        required: [true, "Product Image Cover Public Id is Required!"]
      }
    },
    images: [
      {
        url: {
          type: String,
          trim: true,
          required: [true, "Product Image Url is Required!"]
        },
        imagePublicId: {
          type: String,
          trim: true,
          required: [true, "Product Image Public Id is Required!"]
        }
      }
    ],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Product Must Belong To A Category!"]
    },
    subCategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SubCategory",
        required: [true, "Product Must Belong To A SubCategory!"]
      }
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
      required: [true, "Product Must Belong To A Brand!"]
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [1, "Rating Must Be At Least 1!"],
      max: [5, "Rating Must Be At Most 5!"]
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false
  }
);

//! Virtual Fields for reviews count
productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id"
});

//! 2- Create Model
const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
