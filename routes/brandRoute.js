const express = require("express");

const {
  createBrandValidator,
  getBrandByIdValidator,
  updateBrandValidator,
  deleteBrandValidator,
  getAllBrandsValidator,
  updateBrandImageValidator,
  creareBrandImageValidator
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
const {
  deleteImageFromCloudinary
} = require("../middlewares/deleteImageFromCloudinaryMiddleware");
const BrandModel = require("../models/brandModel");

const router = express.Router();

router
  .route("/")
  .post(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadSingleImage("image"),
    resizeImageWithSharp("image", 600, 95),
    creareBrandImageValidator,
    uploadToCloudinary("ecommerce-api-express-uploads/brands", "image"),
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
    updateBrandImageValidator,
    uploadToCloudinary("ecommerce-api-express-uploads/brands", "image"),
    updateBrandValidator,
    updateBrand
  )
  .delete(
    protectRoutes,
    allowRoles("admin"),
    deleteBrandValidator,
    deleteImageFromCloudinary(BrandModel, "brandId"),
    deleteBrand
  );

module.exports = router;
