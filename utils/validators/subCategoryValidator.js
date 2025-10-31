const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");
const CategoryModel = require("../../models/categoryModel");
const SubCategoryModel = require("../../models/subCategoryModel");

exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category Name is Required!")
    .isLength({ min: 2 })
    .withMessage("Too Short Category Name!")
    .isLength({ max: 32 })
    .withMessage("Too Long Category Name!")
    .custom(async (value, { req }) => {
      const subCategory = await SubCategoryModel.findOne({ name: value });

      if (subCategory) {
        return Promise.reject(
          new Error(
            `SubCategory Should Be Unique. ${value} Name Already Exists For Another SubCategory`
          )
        );
      }
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("Category ID is Required To Belong To This SubCategory!")
    .isMongoId()
    .withMessage("Invalid Category Id Format")
    .custom((categoryId) =>
      CategoryModel.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No Category Found For This ID: ${categoryId}`)
          );
        }
        return true;
      })
    ),
  validatorMiddleware
];

exports.getSubCategoryByIdValidator = [
  check("subCategoryId")
    .isMongoId()
    .withMessage("Invalid SubCategory Id Format")
    .notEmpty()
    .withMessage("SubCategory ID is Required!")
    .custom(async (value) => {
      const subCategory = await SubCategoryModel.findById(value);
      if (!subCategory) {
        return Promise.reject(new Error(`No Categories For This Id: ${value}`));
      }
    }),
  validatorMiddleware
];

exports.updateSubCategoryValidator = [
  check("subCategoryId")
    .isMongoId()
    .withMessage("Invalid SubCategory Id Format")
    .notEmpty()
    .withMessage("SubCategory ID is Required!")
    .custom(async (subCategoryId) => {
      const subCategory = await SubCategoryModel.findById(subCategoryId);
      if (!subCategory) {
        return Promise.reject(
          new Error(`No SubCategories Found For This Id: ${subCategoryId}`)
        );
      }
    }),
  check("name")
    .trim()
    .notEmpty()
    .withMessage("Enter The New SubCategory Name To Update It!")
    .isString()
    .withMessage("SubCategory Name Must Be a String!")
    .isLength({ min: 2, max: 32 })
    .withMessage("SubCategory Name Must Be Between 2 & 32 Characters!")
    .custom(async (value, { req }) => {
      const subCategory = await SubCategoryModel.findOne({ name: value });

      if (
        subCategory &&
        subCategory._id.toString() === req.params.subCategoryId
      ) {
        return Promise.reject(
          new Error(
            `${value} Name Already Exists For This ID: ${req.params.subCategoryId}`
          )
        );
      }
      return true;
    })
    .custom(async (value, { req }) => {
      const subCategory = await SubCategoryModel.findOne({
        name: value,
        _id: { $ne: req.params.subCategoryId }
      });

      if (subCategory) {
        return Promise.reject(
          new Error(`${value} Name Already Exists For Another SubCategory!`)
        );
      }

      return true;
    }),
  check("category")
    .optional()
    .trim()
    .isMongoId()
    .withMessage("Invalid Category Id Format")
    .custom(async (value) => {
      const category = await CategoryModel.findById(value);

      if (!category) {
        return Promise.reject(
          new Error(`No Categories Found For This Id: ${value}`)
        );
      }

      return true;
    }),
  validatorMiddleware
];

exports.deleteSubCategoryValidator = [
  check("subCategoryId")
    .isMongoId()
    .withMessage("Invalid SubCategory Id Format")
    .notEmpty()
    .withMessage("SubCategory ID is Required!")
    .custom(async (subCategoryId) => {
      const subCategory = await SubCategoryModel.findById(subCategoryId);
      if (!subCategory) {
        return Promise.reject(
          new Error(`No SubCategory Found For This ID: ${subCategoryId}`)
        );
      }
      return true;
    }),
  validatorMiddleware
];

const allowedFields = [
  "_id",
  "name",
  "slug",
  "category",
  "createdAt",
  "updatedAt",
  "__v"
];

exports.getAllSubCategoryValidator = [
  check("page")
    .optional()
    .notEmpty()
    .withMessage("Page query cannot be empty.")
    .isNumeric()
    .withMessage("Page Must Be a Number!")
    .toInt()
    .custom((value) => {
      if (value < 1) {
        return Promise.reject(new Error("Page Must Be Greater Than 0!"));
      }
      return true;
    }),
  check("limit")
    .optional()
    .notEmpty()
    .withMessage("Limit query cannot be empty.")
    .isNumeric()
    .withMessage("Limit Must Be a Number!")
    .toInt()
    .custom((value) => {
      if (value < 5) {
        return Promise.reject(new Error("Limit Must Be Greater Than 5!"));
      }
      if (value > 30) {
        return Promise.reject(
          new Error("Limit Must Be Less Than Or Equal To 30!")
        );
      }
      return true;
    }),
  check("fields")
    .optional()
    .notEmpty()
    .withMessage("Fields query cannot be empty.")
    .custom((value) => {
      const fields = value.split(",");
      const disAllowedFields = [];

      fields.forEach((field) => {
        const cleanFields = field.startsWith("-") ? field.slice(1) : field;

        if (!allowedFields.includes(cleanFields)) {
          disAllowedFields.push(field);
        }
      });

      if (disAllowedFields.length > 0) {
        return Promise.reject(
          new Error(
            `The ${
              disAllowedFields.length === 1 ? "field" : "fields"
            } you entered ${disAllowedFields.length === 1 ? "is" : "are"} not valid: ${disAllowedFields.join(", ")}`
          )
        );
      }

      return true;
    }),
  check("sort")
    .optional()
    .notEmpty()
    .withMessage("Sort query cannot be empty.")
    .custom((value) => {
      const sorts = value.split(",");
      const disAllowedSorts = [];

      sorts.forEach((sort) => {
        const cleanSort = sort.startsWith("-") ? sort.slice(1) : sort;

        if (!allowedFields.includes(cleanSort)) {
          disAllowedSorts.push(sort);
        }
      });

      if (disAllowedSorts.length > 0) {
        throw new Error(
          `The ${
            disAllowedSorts.length === 1 ? "sort" : "sorts"
          } you entered ${disAllowedSorts.length === 1 ? "is" : "are"} not valid: ${disAllowedSorts.join(", ")}`
        );
      }

      return true;
    }),
  check("search")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Search query cannot be empty.")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Search can only contain letters, numbers, and spaces"),
  validatorMiddleware
];
