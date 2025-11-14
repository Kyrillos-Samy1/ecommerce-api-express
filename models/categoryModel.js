const mongoose = require("mongoose");
const ProductModel = require("./productModel");
const APIError = require("../utils/apiError");
const SubCategoryModel = require("./subCategoryModel");

//! 1- Create Category Schema
const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Category Name is Required!"],
      unique: [true, "Category Must Be Unique!"],
      minLength: [3, "Too Short Category Name!"],
      maxLength: [32, "Too Long Category Name!"]
    },
    image: {
      url: {
        type: String,
        trim: true,
        required: [true, "Category Image Url is Required!"]
      },
      imagePublicId: {
        type: String,
        trim: true,
        required: [true, "Category Image Public Id is Required!"]
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

//! Prenvent deleting category if there are subcategories or products linked to it
CategorySchema.pre("findOneAndDelete", async function (next) {
  try {
    const filter = this.getFilter();
    const categoryId = filter._id;
    if (!categoryId) return next();

    //! Check if there are any subcategories or products linked to this category
    const [linkedSubCategories, linkedProducts] = await Promise.all([
      SubCategoryModel.find({ category: categoryId }).limit(1),
      ProductModel.find({ category: categoryId }).limit(1)
    ]);

    if (linkedSubCategories.length > 0) {
      return next(
        new APIError(
          "Cannot delete category! There are subcategories linked to this category. Remove or reassign them first.",
          400,
          "Category Deletion Error"
        )
      );
    }

    if (linkedProducts.length > 0) {
      return next(
        new APIError(
          "Cannot delete category! There are products linked to this category. Remove or reassign them first.",
          400,
          "Category Deletion Error"
        )
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

//! 2- Create Model
const CategoryModel = mongoose.model("Category", CategorySchema);

module.exports = CategoryModel;
