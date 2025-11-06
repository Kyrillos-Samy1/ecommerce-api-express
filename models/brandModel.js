const mongoose = require("mongoose");

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
        trim: true,
        required: [true, "Brand Image is Required!"]
      },
      imagePublicId: {
        type: String,
        trim: true,
        required: [true, "Brand Image Public Id is Required!"]
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
const BrandModel = mongoose.model("Brand", BrandSchema);

module.exports = BrandModel;
