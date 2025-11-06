const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");
const BrandModel = require("../../models/brandModel");

exports.createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Brand Name is Required!")
    .isLength({ min: 2 })
    .withMessage("Too Short Brand Name!")
    .isLength({ max: 32 })
    .withMessage("Too Long Brand Name!")
    .custom((brandName) =>
      BrandModel.findOne({ name: brandName }).then((brand) => {
        if (brand) {
          return Promise.reject(new Error("Brand Name Already Exists!"));
        }
        return true;
      })
    ),
  check("image").trim().notEmpty().withMessage("Brand Image is Required!"),
  validatorMiddleware
];

exports.getBrandByIdValidator = [
  check("brandId")
    .isMongoId()
    .withMessage("Invalid Brand Id Format")
    .notEmpty()
    .withMessage("Brand ID is Required!")
    .custom((value) =>
      BrandModel.findById(value).then((brand) => {
        if (!brand) {
          return Promise.reject(new Error(`No Brands For This ID: ${value}`));
        }
        return true;
      })
    ),
  validatorMiddleware
];

exports.updateBrandValidator = [
  check("brandId")
    .isMongoId()
    .withMessage("Invalid Brand Id Format")
    .notEmpty()
    .withMessage("Brand ID is Required!")
    .custom((brandId) =>
      BrandModel.findById(brandId).then((brand) => {
        if (!brand) {
          return Promise.reject(
            new Error(`No Brand Found For This ID: ${brandId}`)
          );
        }
        return true;
      })
    ),
  check("name")
    .optional()
    .isString()
    .withMessage("Brand Name Must Be a String!")
    .isLength({ min: 2, max: 32 })
    .withMessage("Brand Name Must Be Between 2 & 32 Characters!")
    .custom(async (value, { req }) => {
      const brand = await BrandModel.findOne({ name: value });

      if (brand && brand._id.toString() === req.params.brandId) {
        return Promise.reject(
          new Error(
            `${value} Name Already Exists For This ID: ${req.params.brandId}`
          )
        );
      }
      return true;
    })
    .custom(async (value, { req }) => {
      const brand = await BrandModel.findOne({
        name: value,
        _id: { $ne: req.params.brandId }
      });

      if (brand) {
        return Promise.reject(
          new Error(`${value} Name Already Exists For Another Brand!`)
        );
      }

      return true;
    }),
  validatorMiddleware
];

exports.deleteBrandValidator = [
  check("brandId")
    .isMongoId()
    .withMessage("Invalid Brand Id Format")
    .notEmpty()
    .withMessage("Brand ID is Required!")
    .custom(async (brandId) => {
      const brand = await BrandModel.findById(brandId);
      if (!brand) {
        return Promise.reject(
          new Error(`No Brand Found For This ID: ${brandId}`)
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

exports.getAllBrandsValidator = [
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
        throw new Error(
          `The ${
            disAllowedFields.length === 1 ? "field" : "fields"
          } you entered ${disAllowedFields.length === 1 ? "is" : "are"} not valid: ${disAllowedFields.join(", ")}`
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
