const SubCategoryModel = require("../models/subCategoryModel");
const {
  deleteOneDocument,
  updateOneDocument,
  getDocumentById,
  getAllDocuments,
  createDocumnet
} = require("./handlersFactory");

//! @desc Create subCategory
//! @route POST /api/v1/subcategories
//! @access Private/Admin | Manager
exports.createSubCategory = createDocumnet(SubCategoryModel, "SubCategory");

//! Nested Route
//! @desc Get All SubCategories Belongs To Its Main Category
//! @route GET /api/v1/categories/:categoryId/subcategories

//! @desc Get All SubCategories With Pagination
//! @route GET /api/v1/subcategories
//! @access Public
exports.getAllSubCategories = getAllDocuments(
  SubCategoryModel,
  "SubCategories",
  [],
  ["name", "slug"],
  "categoryId"
);

//! @desc Get Specific SubCategories
//! @route GET /api/v1/subcategories/:id
//! @access Public
exports.getSubCategoryById = getDocumentById(
  SubCategoryModel,
  "SubCategory",
  [{ path: "category", select: "-__v" }],
  "subCategoryId",
  "-__v"
);

//! @desc Update Specific SubCategory
//! @route PUT /api/v1/subcategories/:id
//! @access Private/Admin | Manager
exports.updateSubCategory = updateOneDocument(
  SubCategoryModel,
  "SubCategory",
  "subCategoryId"
);

//! @desc Delete Specific SubCategory
//! @route DELETE /api/v1/subcategories/:id
//! @access Private/Admin
exports.deleteSubCategory = deleteOneDocument(
  SubCategoryModel,
  "SubCategory",
  "subCategoryId"
);
