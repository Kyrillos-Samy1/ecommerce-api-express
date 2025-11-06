const mongoose = require("mongoose");

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

//! 2- Create Model
const CategoryModel = mongoose.model("Category", CategorySchema);

module.exports = CategoryModel;
