const express = require("express");
const {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts
} = require("../services/productServices");

const {
  createProductValidator,
  getProductByIdValidator,
  updateProductValidator,
  deleteProductValidator,
  updateArrayOfImagesValidator,
  checkArrayOfImagesAndImageCoverFoundValidator,
  getAllProductsValidator,
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
  uploadSingleImage,
  uploadMultipleImages
} = require("../middlewares/uploadImageMiddleware");

const router = express.Router();

//! To Access Params From Parent Router
router.use("/:productId/reviews", ReviewsRoutes);

// router
// .route("/imageCover")
// .post(
//   protectRoutes,
//   allowRoles("admin", "manager"),
//   uploadSingleImage("imageCover"),
//   resizeImageWithSharp("imageCover", 900, 95),
//   uploadToCloudinary(
//     "ecommerce-api-express-uploads/products/imageCover",
//     "imageCover"
//   ),
//   createProductValidator,
//   createProduct
// )

router
  .route("/")
  .post(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadMultipleImages([
      { name: "images", maxCount: 5 },
      { name: "imageCover", maxCount: 1 }
    ]),
    resizeMultipleImagesWithSharp("images", 600, 95),
    resizeMultipleImagesWithSharp("imageCover", 900, 95),
    checkArrayOfImagesAndImageCoverFoundValidator,
    uploadToCloudinaryArrayOfImages(
      "ecommerce-api-express-uploads/products/images",
      "images"
    ),
    uploadToCloudinary(
      "ecommerce-api-express-uploads/products/imageCover",
      "imageCover"
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
    uploadMultipleImages([{ name: "images", maxCount: 5 }]),
    resizeMultipleImagesWithSharp("images", 600, 95),
    updateArrayOfImagesValidator,
    uploadToCloudinaryArrayOfImages(
      "ecommerce-api-express-uploads/products/images",
      "images"
    ),
    updateProduct
  );

module.exports = router;
