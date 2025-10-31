const mongoose = require("mongoose");

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

const SubCategoryModel = mongoose.model("SubCategory", subCategorySchema);

module.exports = SubCategoryModel;
