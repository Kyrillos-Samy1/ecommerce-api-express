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
const { cleanOrphanReviews } = require("../middlewares/cleanOrphanReviews");

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
    cleanOrphanReviews,
    createProduct
  )
  .get(getAllProductsValidator, cleanOrphanReviews, getAllProducts);

router
  .route("/:productId")
  .get(getProductByIdValidator, cleanOrphanReviews, getProductById)
  .put(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadMixedImages,
    resizeProductImage,
    updateProductValidator,
    cleanOrphanReviews,
    updateProduct
  )
  .delete(
    protectRoutes,
    allowRoles("admin"),
    deleteProductValidator,
    cleanOrphanReviews,
    deleteProduct
  );

module.exports = router;
