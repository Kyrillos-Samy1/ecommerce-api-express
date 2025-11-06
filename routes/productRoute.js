const express = require("express");
const {
  createProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct
} = require("../services/productServices");

const {
  createProductValidator,
  getProductByIdValidator,
  updateProductValidator,
  deleteProductValidator,
  getAllProductsValidator,
  updateArrayOfImagesValidator
} = require("../utils/validators/productValidator");
const { protectRoutes, allowRoles } = require("../services/authServices");
const ReviewsRoutes = require("./reviewRoute");
const {
  resizeImageWithSharp,
  resizeMultipleImagesWithSharp
} = require("../middlewares/resizeImageWithSharpMiddleware");
const {
  uploadToCloudinary,
  uploadToCloudinaryArrayOfImages
} = require("../middlewares/uplaodToCloudinaryMiddleware");
const {
  uploadArrayOfImages,
  uploadSingleImage
} = require("../middlewares/uploadImageMiddleware");

const router = express.Router();

//! To Access Params From Parent Router
router.use("/:productId/reviews", ReviewsRoutes);

router
  .route("/")
  .post(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadArrayOfImages("images", 5),
    resizeMultipleImagesWithSharp("images", 600, 95),
    resizeImageWithSharp("imageCover", 900, 95),
    uploadToCloudinary(
      "ecommerce-api-express-uploads/products",
      (req) => req.body.imageCover.tempFilename,
      "imageCover"
    ),
    uploadToCloudinaryArrayOfImages(
      "ecommerce-api-express-uploads/products",
      "images"
    ),
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
    uploadSingleImage("imageCover"),
    resizeImageWithSharp("imageCover", 900, 95),
    uploadToCloudinary(
      "ecommerce-api-express-uploads/products/imageCover",
      (req) => req.body.imageCover.tempFilename,
      "imageCover"
    ),
    updateProductValidator,
    updateProduct
  )
  .delete(
    protectRoutes,
    allowRoles("admin"),
    deleteProductValidator,
    deleteProduct
  );

router
  .route("/images/:productId")
  .put(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadArrayOfImages("images", 5),
    resizeMultipleImagesWithSharp("images", 600, 95),
    uploadToCloudinaryArrayOfImages(
      "ecommerce-api-express-uploads/products/images",
      "images"
    ),
    updateArrayOfImagesValidator,
    updateProduct
  );

module.exports = router;
