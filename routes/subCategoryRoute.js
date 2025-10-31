const express = require("express");
const {
  createSubCategory,
  getSubCategoryById,
  getAllSubCategories,
  updateSubCategory,
  deleteSubCategory
} = require("../services/subCategoryServices");
const {
  createSubCategoryValidator,
  getSubCategoryByIdValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
  getAllSubCategoryValidator
} = require("../utils/validators/subCategoryValidator");
const { protectRoutes, allowRoles } = require("../services/authServices");
const {
  setParamIdToBodyAndUserId
} = require("../middlewares/setParamIdToBody");

//! mergeParams: Allow Us To Access Params From Parent Router
//! Ex: We Need To Access categoryId From Category Router
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    protectRoutes,
    allowRoles("admin", "manager"),
    setParamIdToBodyAndUserId("categoryId", "category", "user"),
    createSubCategoryValidator,
    createSubCategory
  )
  .get(getAllSubCategoryValidator, getAllSubCategories);

router
  .route("/:subCategoryId")
  .get(getSubCategoryByIdValidator, getSubCategoryById)
  .put(
    protectRoutes,
    allowRoles("admin", "manager"),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    protectRoutes,
    allowRoles("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

module.exports = router;
