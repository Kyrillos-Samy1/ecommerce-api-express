const express = require("express");
const {
  createProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
  uploadMixedImages,
  resizeProductImage
} = require("../services/productServices");

const {
  createProductValidator,
  getProductByIdValidator,
  updateProductValidator,
  deleteProductValidator,
  getAllProductsValidator
} = require("../utils/validators/productValidator");
const { protectRoutes, allowRoles } = require("../services/authServices");
const ReviewsRoutes = require("./reviewRoute");

const router = express.Router();

//! To Access Params From Parent Router
router.use("/:productId/reviews", ReviewsRoutes);

router
  .route("/")
  .post(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadMixedImages,
    resizeProductImage,
    createProductValidator,
    createProduct
  )
  .get(getAllProductsValidator, getAllProducts);

router
  .route("/:productId")
  .get(getProductByIdValidator, getProductById)
  .put(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadMixedImages,
    resizeProductImage,
    updateProductValidator,
    updateProduct
  )
  .delete(
    protectRoutes,
    allowRoles("admin"),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
