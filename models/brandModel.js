const mongoose = require("mongoose");
const APIError = require("../utils/apiError");
const ProductModel = require("./productModel");

//! 1- Create Category Schema
const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Brand Name is Required!"],
      unique: [true, "Brand Must Be Unique!"],
      minLength: [2, "Too Short Brand Name!"],
      maxLength: [32, "Too Long Brand Name!"]
    },
    image: {
      url: {
        type: String,
        trim: true
      },
      imagePublicId: {
        type: String,
        trim: true
      }
    },
    //! A and B => shopping.com/a-and-b
    slug: {
      type: String,
      lowercase: true
    }
  },
  { timestamps: true }
);

//! Prevent Brand Deletion if there are any products linked to it
BrandSchema.pre("findOneAndDelete", async function (next) {
  const brandId = this.getFilter()._id;

  const product = await ProductModel.findOne({ brand: brandId });
  if (product) {
    return next(
      new APIError(
        "Cannot Delete Brand! There are products linked to this brand. Remove or reassign them first.",
        400,
        "Brand Deletion Error"
      )
    );
  }

  next();
});

//! 2- Create Model
const BrandModel = mongoose.model("Brand", BrandSchema);

module.exports = BrandModel;
