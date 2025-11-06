const express = require("express");

const {
  createBrandValidator,
  getBrandByIdValidator,
  updateBrandValidator,
  deleteBrandValidator,
  getAllBrandsValidator
} = require("../utils/validators/brandValidator");
const {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand
} = require("../services/brandServices");
const { protectRoutes, allowRoles } = require("../services/authServices");
const {
  resizeImageWithSharp
} = require("../middlewares/resizeImageWithSharpMiddleware");
const {
  uploadToCloudinary
} = require("../middlewares/uplaodToCloudinaryMiddleware");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

const router = express.Router();

router
  .route("/")
  .post(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadSingleImage("image"),
    resizeImageWithSharp("image", 600, 95),
    uploadToCloudinary(
      "ecommerce-api-express-uploads/brands",
      (req) => req.body.image.tempFilename,
      "image"
    ),
    createBrandValidator,
    createBrand
  )
  .get(getAllBrandsValidator, getAllBrands);

router
  .route("/:brandId")
  .get(getBrandByIdValidator, getBrandById)
  .put(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadSingleImage("image"),
    resizeImageWithSharp("image", 600, 95),
    uploadToCloudinary(
      "ecommerce-api-express-uploads/brands",
      (req) => req.body.image.tempFilename,
      "image"
    ),
    updateBrandValidator,
    updateBrand
  )
  .delete(
    protectRoutes,
    allowRoles("admin"),
    deleteBrandValidator,
    deleteBrand
  );

module.exports = router;
