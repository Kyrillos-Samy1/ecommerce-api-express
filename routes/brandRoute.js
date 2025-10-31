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
  deleteBrand,
  uploadBrandImage,
  resizeBrandImage
} = require("../services/brandServices");
const { protectRoutes, allowRoles } = require("../services/authServices");

const router = express.Router();

router
  .route("/")
  .post(
    protectRoutes,
    allowRoles("admin", "manager"),
    uploadBrandImage,
    resizeBrandImage,
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
    uploadBrandImage,
    resizeBrandImage,
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
