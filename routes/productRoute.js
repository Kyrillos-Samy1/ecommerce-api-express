const express = require("express");
const {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts,
  deleteProductImage
} = require("../services/productServices");

const {
  createProductValidator,
  getProductByIdValidator,
  updateProductValidator,
  deleteProductValidator,
  checkArrayOfImagesAndImageCoverFoundValidator,
  getAllProductsValidator,
  checkArrayOfImagesAndImageCoverFoundValidatorForUpdate
} = require("../utils/validators/productValidator");
const { protectRoutes, allowRoles } = require("../services/authServices");
const ReviewsRoutes = require("./reviewRoute");
const {
  resizeMultipleImagesWithSharp
} = require("../middlewares/resizeImageWithSharpMiddleware");
const {
  uploadToCloudinary,
  uploadToCloudinaryArrayOfImages
} = require("../middlewares/uplaodToCloudinaryMiddleware");
const {
  uploadMultipleImages
} = require("../middlewares/uploadImageMiddleware");
const {
  deleteImagesFromCloudinary
} = require("../middlewares/deleteImageFromCloudinaryMiddleware");

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
  .route("/images/:productId")
  .delete(
    protectRoutes,
    allowRoles("admin", "manager"),
    deleteImagesFromCloudinary,
    deleteProductImage
  );

router
  .route("/:productId")
  .get(getProductByIdValidator, getProductById)
  .put(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadMultipleImages([
      { name: "images", maxCount: 5 },
      { name: "imageCover", maxCount: 1 }
    ]),
    resizeMultipleImagesWithSharp("images", 600, 95),
    resizeMultipleImagesWithSharp("imageCover", 900, 95),
    checkArrayOfImagesAndImageCoverFoundValidatorForUpdate,
    uploadToCloudinaryArrayOfImages(
      "ecommerce-api-express-uploads/products/images",
      "images"
    ),
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
    deleteImagesFromCloudinary,
    deleteProduct
  );

module.exports = router;
