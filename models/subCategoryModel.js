const mongoose = require("mongoose");
const APIError = require("../utils/apiError");
const ProductModel = require("./productModel");

//! 1- Create Category Schema
const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, "SubCategory Name Should Be Unique!"],
      minLength: [2, "Too Short SubCategory Name!"],
      maxLength: [32, "Too Long SubCategory Name!"]
    },
    slug: {
      type: String,
      lowercase: true
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "SubCategory Must Be Belont To Parent Category!"]
    }
  },
  { timestamps: true }
);

//! Prevent SubCategory Deletion if there are any products linked to it
subCategorySchema.pre("findOneAndDelete", async function (next) {
  const filter = this.getFilter();
  const subCategoryId = filter._id;
  if (!subCategoryId) return next();

  const product = await ProductModel.findOne({ subCategory: subCategoryId });
  if (product) {
    return next(
      new APIError(
        "Cannot Delete SubCategory! There are products linked to this subCategory. Remove or reassign them first.",
        400,
        "SubCategory Deletion Error"
      )
    );
  }

  next();
});

//! 2- Create Model
const SubCategoryModel = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubCategoryModel;
