const express = require("express");

const {
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createCategory
} = require("../services/categoryServices");
const {
  getCategoryByIdValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  createCategoryValidator,
  getAllCategoryValidator,
  updateImageCategoryValidator,
  createImageCategoryValidator
} = require("../utils/validators/categoryValidator");

const subCategoryRoutes = require("./subCategoryRoute");
const { protectRoutes, allowRoles } = require("../services/authServices");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const {
  resizeImageWithSharp
} = require("../middlewares/resizeImageWithSharpMiddleware");
const {
  uploadImageToCloudinary
} = require("../middlewares/uplaodToCloudinaryMiddleware");
const {
  deleteImageFromCloudinary
} = require("../middlewares/deleteImageFromCloudinaryMiddleware");
const CategoryModel = require("../models/categoryModel");

const router = express.Router();

//! To Access Params From Parent Router
router.use("/:categoryId/subcategories", subCategoryRoutes);

router
  .route("/")
  .post(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadSingleImage("image"),
    resizeImageWithSharp("image", 600, 95, "categoryId", CategoryModel, "Category"),
    createImageCategoryValidator,
    uploadImageToCloudinary("ecommerce-api-express-uploads/categories", "image"),
    createCategoryValidator,
    createCategory
  )
  .get(getAllCategoryValidator, getAllCategories);

router
  .route("/:categoryId")
  .get(getCategoryByIdValidator, getCategoryById)
  .put(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadSingleImage("image"),
    resizeImageWithSharp(
      "image",
      600,
      95,
      "categoryId",
      CategoryModel,
      "Category"
    ),
    updateImageCategoryValidator,
    uploadImageToCloudinary("ecommerce-api-express-uploads/categories", "image"),
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    protectRoutes,
    allowRoles("admin"),
    deleteCategoryValidator,
    deleteImageFromCloudinary(CategoryModel, "categoryId"),
    deleteCategory
  );

module.exports = router;
