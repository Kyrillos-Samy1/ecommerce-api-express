const mongoose = require("mongoose");
const {
  applyImageUrlMiddleware
} = require("../middlewares/imageUrlBuilderMiddleware");

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
      type: String,
      trim: true,
      required: [true, "Category Image is Required!"]
    },
    //! A and B => shopping.com/a-and-b
    slug: {
      type: String,
      lowercase: true
    }
  },
  { timestamps: true }
);

//! Attach image URL to image field
applyImageUrlMiddleware(CategorySchema, "categories");

//! 2- Create Model
const CategoryModel = mongoose.model("Category", CategorySchema);

module.exports = CategoryModel;
