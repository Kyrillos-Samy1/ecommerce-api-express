const express = require("express");

const {
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createCategory,
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
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const {
  resizeImageWithSharp
} = require("../middlewares/resizeImageWithSharpMiddleware");
const {
  uploadToCloudinary
} = require("../middlewares/uplaodToCloudinaryMiddleware");

const router = express.Router();

//! To Access Params From Parent Router
router.use("/:categoryId/subcategories", subCategoryRoutes);

router
  .route("/")
  .post(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadSingleImage("image"),
    resizeImageWithSharp("image", 600, 95),
    uploadToCloudinary(
      "ecommerce-api-express-uploads/categories",
      (req) => req.body.image.tempFilename,
      "image"
    ),
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
    resizeImageWithSharp("image", 600, 95),
    uploadToCloudinary(
      "ecommerce-api-express-uploads/categories",
      (req) => req.body.image.tempFilename,
      "image"
    ),
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
