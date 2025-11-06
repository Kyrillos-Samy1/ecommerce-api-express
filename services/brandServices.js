// const asyncHandler = require("express-async-handler");
const BrandModel = require("../models/brandModel");
const {
  deleteOneDocument,
  updateOneDocument,
  getDocumentById,
  getAllDocuments,
  createDocumnet
} = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

//! @desc Create Brand
//! @route POST /api/v1/brands
//! @access Private/Admin | Manager
exports.createBrand = createDocumnet(BrandModel, "Brand");

exports.uploadBrandImage = uploadSingleImage("image");

//! @desc Get All Brands With Pagination
//! @route GET /api/v1/brands
//! @access Public
exports.getAllBrands = getAllDocuments(
  BrandModel,
  "Brands",
  [],
  ["name", "slug"],
  "brandId"
);

//! @desc Get Specific Brand
//! @route GET /api/v1/brands/:id
//! @access Public
exports.getBrandById = getDocumentById(
  BrandModel,
  "Brand",
  [],
  "brandId",
  "-__v"
);

//! @desc Update Specific Brand
//! @route PUT /api/v1/brands/:id
//! @access Private/Admin | Manager
exports.updateBrand = updateOneDocument(BrandModel, "Brand", "brandId");

//! @desc Delete Specific Brand
//! @route DELETE /api/v1/brands/:id
//! @access Private/Admin
exports.deleteBrand = deleteOneDocument(BrandModel, "Brand", "brandId");
