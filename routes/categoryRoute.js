const express = require("express");

const {
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createCategory,
  uploadCategoryImage,
  resizeCategoryImage
} = require("../services/categoryServices");
const {
  getCategoryByIdValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  createCategoryValidator,
  getAllCategoryValidator
} = require("../utils/validators/categoryValidator");

const subCategoryRoutes = require("./subCategoryRoute");
const { protectRoutes, allowRoles } = require("../services/authServices");

const router = express.Router();

//! To Access Params From Parent Router
router.use("/:categoryId/subcategories", subCategoryRoutes);

router
  .route("/")
  .post(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadCategoryImage,
    resizeCategoryImage,
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
    uploadCategoryImage,
    resizeCategoryImage,
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    protectRoutes,
    allowRoles("admin"),
    deleteCategoryValidator,
    deleteCategory
  );

module.exports = router;
