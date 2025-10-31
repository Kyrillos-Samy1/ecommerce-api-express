const sharp = require("sharp");
const CategoryModel = require("../models/categoryModel");

const {
  deleteOneDocument,
  updateOneDocument,
  getDocumentById,
  getAllDocuments,
  createDocumnet
} = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

//! @desc Create Category
//! @route POST /api/v1/categories
//! @access Private/Admin | Manager
exports.createCategory = createDocumnet(CategoryModel, "Category");

exports.uploadCategoryImage = uploadSingleImage("image");

//! Image Processing Using Sharp
exports.resizeCategoryImage = async (req, res, next) => {
  if (!req.file) return next();

  req.body.image = `category-${Date.now()}.webp`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("webp")
    .webp({ quality: 90 })
    .toFile(`uploads/categories/${req.body.image}`);

  next();
};

//! @desc Get All Categories With Pagination
//! @route GET /api/v1/categories
//! @access Public
exports.getAllCategories = getAllDocuments(
  CategoryModel,
  "Categories",
  [],
  ["name", "slug"],
  "categoryId"
);

//! @desc Get Specific Categories
//! @route GET /api/v1/categories/:id
//! @access Public
exports.getCategoryById = getDocumentById(
  CategoryModel,
  "Brand",
  [],
  "categoryId",
  "-__v"
);

//! @desc Update Specific Category
//! @route PUT /api/v1/categories/:id
//! @access Private/Admin | Manager
exports.updateCategory = updateOneDocument(
  CategoryModel,
  "Category",
  "categoryId"
);

//! @desc Delete Specific Category
//! @route DELETE /api/v1/categories/:id
//! @access Private/Admin
exports.deleteCategory = deleteOneDocument(
  CategoryModel,
  "Category",
  "categoryId"
);
