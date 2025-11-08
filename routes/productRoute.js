const express = require("express");
const {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts,
  updateSpecificImageFromArrayOfImages,
  addSpecificImageToArrayOfImages,
  deleteSpecificImagesFromArrayOfImages
} = require("../services/productServices");

const {
  createProductValidator,
  getProductByIdValidator,
  updateProductValidator,
  deleteProductValidator,
  getAllProductsValidator,
  checkImageCoverFoundValidatorForUpdateValidator,
  updateArrayOfImagesValidator,
  addSpecificImageToArrayOfImagesValidator,
  checkImagesInFilesForUpdateProductValidator,
  deleteSpecificImagesFromArrayOfImagesValidator,
  updateSpecificImageFromArrayOfImagesValidator
} = require("../utils/validators/productValidator");
const { protectRoutes, allowRoles } = require("../services/authServices");
const ReviewsRoutes = require("./reviewRoute");
const {
  resizeMultipleImagesWithSharp
} = require("../middlewares/resizeImageWithSharpMiddleware");
const {
  uploadImageToCloudinary,
  uploadToCloudinaryArrayOfImages
} = require("../middlewares/uplaodToCloudinaryMiddleware");
const {
  uploadMultipleImages
} = require("../middlewares/uploadImageMiddleware");
const {
  deleteImagesFromCloudinary
} = require("../middlewares/deleteImageFromCloudinaryMiddleware");
const ProductModel = require("../models/productModel");

const router = express.Router();

//! To Access Params From Parent Router
router.use("/:productId/reviews", ReviewsRoutes);

router
  .route("/")
  .post(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadMultipleImages([
      { name: "images", maxCount: 5 },
      { name: "imageCover", maxCount: 1 }
    ]),
    resizeMultipleImagesWithSharp(
      "images",
      600,
      95,
      "",
      ProductModel,
      "Images"
    ),
    resizeMultipleImagesWithSharp(
      "imageCover",
      900,
      95,
      "",
      ProductModel,
      "Image Cover"
    ),
    uploadToCloudinaryArrayOfImages(
      "ecommerce-api-express-uploads/products/images",
      "images"
    ),
    uploadImageToCloudinary(
      "ecommerce-api-express-uploads/products/imageCover",
      "imageCover"
    ),
    createProductValidator,
    createProduct
  )
  .get(getAllProductsValidator, getAllProducts);

router
  .route("/images/:productId")
  .post(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadMultipleImages([
      { name: "images", maxCount: 5 },
      { name: "imageCover", maxCount: 1 }
    ]),
    addSpecificImageToArrayOfImagesValidator,
    resizeMultipleImagesWithSharp(
      "images",
      600,
      95,
      "productId",
      ProductModel,
      "Images"
    ),
    uploadToCloudinaryArrayOfImages(
      "ecommerce-api-express-uploads/products/images",
      "images"
    ),
    addSpecificImageToArrayOfImages
  )
  .patch(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadMultipleImages([
      { name: "images", maxCount: 5 },
      { name: "imageCover", maxCount: 1 }
    ]),
    updateArrayOfImagesValidator,
    resizeMultipleImagesWithSharp(
      "images",
      600,
      95,
      "productId",
      ProductModel,
      "Images"
    ),
    uploadToCloudinaryArrayOfImages(
      "ecommerce-api-express-uploads/products/images",
      "images"
    ),
    updateSpecificImageFromArrayOfImagesValidator,
    updateSpecificImageFromArrayOfImages
  )
  .delete(
    protectRoutes,
    allowRoles("admin", "manager"),
    deleteImagesFromCloudinary,
    deleteSpecificImagesFromArrayOfImagesValidator,
    deleteSpecificImagesFromArrayOfImages
  );

router
  .route("/:productId")
  .get(getProductByIdValidator, getProductById)
  .put(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadMultipleImages([
      { name: "imageCover", maxCount: 1 },
      { name: "images", maxCount: 5 }
    ]),
    checkImagesInFilesForUpdateProductValidator,
    resizeMultipleImagesWithSharp(
      "imageCover",
      900,
      95,
      "productId",
      ProductModel,
      "Image Cover"
    ),
    checkImageCoverFoundValidatorForUpdateValidator,
    uploadImageToCloudinary(
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
    deleteImagesFromCloudinary,
    deleteProduct
  );

module.exports = router;
