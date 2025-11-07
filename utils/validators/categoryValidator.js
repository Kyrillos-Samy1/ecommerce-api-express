const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");
const CategoryModel = require("../../models/categoryModel");
const APIError = require("../apiError");

exports.createCategoryValidator = [
  check("name")
    .trim()
    .notEmpty()
    .withMessage("Category Name is Required!")
    .isLength({ min: 3 })
    .withMessage("Too Short Category Name!")
    .isLength({ max: 32 })
    .withMessage("Too Long Category Name!")
    .custom(async (value) => {
      const category = await CategoryModel.findOne({ name: value });
      if (category) {
        return Promise.reject(new Error("Category Name Already Exists!"));
      }
    }),
  validatorMiddleware
];

exports.createImageCategoryValidator = [
  check("image")
    .notEmpty()
    .withMessage("Category Image is Required!")
    .isObject()
    .withMessage("Category Image Must Be An Object"),
  (req, res, next) => {
    if (req.validationMessage) {
      return next(new APIError(req.validationMessage, 400, "ValidationError"));
    }
    next();
  }
];

exports.updateImageCategoryValidator = [
  check("image").custom(async (_value, { req }) => {
    const category = await CategoryModel.findById(req.params.categoryId);

    if (!category) {
      req.validationMessage = `No Category Found For This ID: ${req.params.categoryId}`;
      return true;
    }

    if (!category.image) {
      req.validationMessage = "Category Has No Image!";
      return true;
    }

    return true;
  }),
  (req, res, next) => {
    if (req.validationMessage) {
      return next(new APIError(req.validationMessage, 400, "ValidationError"));
    }
    next();
  }
];

exports.getCategoryByIdValidator = [
  check("categoryId")
    .isMongoId()
    .withMessage("Invalid Category ID Format")
    .notEmpty()
    .withMessage("Category ID is Required!")
    .custom(async (value) => {
      const category = await CategoryModel.findById(value);
      if (!category) {
        return Promise.reject(new Error("Category Not Found!"));
      }
    }),
  validatorMiddleware
];

exports.updateCategoryValidator = [
  check("categoryId")
    .isMongoId()
    .withMessage("Invalid Category Id Format")
    .notEmpty()
    .withMessage("Category ID is Required!")
    .custom(async (categoryId) => {
      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        return Promise.reject(
          new Error(`No Category Found For This ID: ${categoryId}`)
        );
      }
    }),
  check("name")
    .optional()
    .trim()
    .isString()
    .withMessage("Category Name Must Be a String!")
    .isLength({ min: 2, max: 32 })
    .withMessage("Category Name Must Be Between 2 & 32 Characters!")
    .custom(async (value, { req }) => {
      const Category = await CategoryModel.findOne({
        name: value,
        _id: { $ne: req.params.categoryId }
      });

      if (Category) {
        return Promise.reject(
          new Error(`${value} Name Already Exists For Another Category!`)
        );
      }

      return true;
    }),
  validatorMiddleware
];

exports.deleteCategoryValidator = [
  check("categoryId")
    .isMongoId()
    .withMessage("Invalid Category Id Format")
    .notEmpty()
    .withMessage("Category ID is Required!")
    .custom(async (categoryId) => {
      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        return Promise.reject(
          new Error(`No Category Found For This ID: ${categoryId}`)
        );
      }
      return true;
    }),
  validatorMiddleware
];

const allowedFields = [
  "_id",
  "name",
  "image",
  "slug",
  "createdAt",
  "updatedAt",
  "__v"
];

exports.getAllCategoryValidator = [
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
    .trim()
    .isString()
    .withMessage("Search must be a string")
    .notEmpty()
    .withMessage("Search query cannot be empty.")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Search can only contain letters, numbers, and spaces"),
  validatorMiddleware
];
