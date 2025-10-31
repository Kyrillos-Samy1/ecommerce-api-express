const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");
const ReviewModel = require("../../models/reviewModel");
const ProductModel = require("../../models/productModel");
const UserModel = require("../../models/userModel");

exports.createReviewValidator = [
  check("review")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Too Short Review!")
    .isLength({ max: 150 })
    .withMessage("Too Long Review!"),
  check("rating")
    .notEmpty()
    .withMessage("Rating is Required!")
    .toFloat()
    .isNumeric()
    .withMessage("Rating Must Be a Number!")
    .isLength({ min: 1, max: 5 })
    .withMessage("Rating Must Be Between 1 and 5 Digits!"),
  check("product")
    .notEmpty()
    .withMessage("Product ID is Required!")
    .isMongoId()
    .withMessage("Invalid Product Id Format")
    .custom(async (productId) => {
      const isProductExist = await ProductModel.findById(productId);
      if (!isProductExist) {
        throw new Error("Product Not Found!");
      }

      return true;
    }),
  check("user")
    .notEmpty()
    .withMessage("User ID is Required!")
    .isMongoId()
    .withMessage("Invalid User Id Format")
    .custom(async (userId, { req }) => {
      const isUserExist = await UserModel.findById(userId);
      if (!isUserExist) {
        throw new Error("User Not Found!");
      }

      if (isUserExist._id.toString() !== req.user._id.toString()) {
        throw new Error("User ID does not match the logged-in account!");
      }

      const productId = req.body.product;
      const isUserAlreadyReviewed = await ReviewModel.findOne({
        user: userId,
        product: productId
      });
      if (isUserAlreadyReviewed) {
        throw new Error("You have already reviewed this product!");
      }

      return true;
    }),

  validatorMiddleware
];

exports.updateReviewValidator = [
  check("reviewId")
    .isMongoId()
    .withMessage("Invalid Review Id Format")
    .notEmpty()
    .withMessage("Review ID is Required!")
    .custom(async (reviewId, { req }) => {
      const Review = await ReviewModel.findById(reviewId);
      if (!Review) {
        throw new Error(`No Review Found For This ID: ${reviewId}`);
      }

      if (Review.user.toString() !== req.user._id.toString()) {
        throw new Error("You are not allowed to update this review!");
      }
      return true;
    }),
  check("review")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Too Short Review!")
    .isLength({ max: 150 })
    .withMessage("Too Long Review!")
    .custom(async (value, { req }) => {
      const review = await ReviewModel.findById(req.params.reviewId);
      if (!review) {
        throw new Error(`No Review Found For This ID: ${req.params.reviewId}`);
      }
      if (review.review === value) {
        throw new Error("Review Is Not Changed!");
      }
      return true;
    }),
  check("rating")
    .optional()
    .toFloat()
    .isNumeric()
    .withMessage("Rating Must Be a Number!")
    .isLength({ min: 1, max: 5 })
    .withMessage("Rating Must Be Between 1 and 5 Digits!"),

  validatorMiddleware
];

exports.getReviewByIdValidator = [
  check("reviewId")
    .isMongoId()
    .withMessage("Invalid Review Id Format")
    .notEmpty()
    .withMessage("Review ID is Required!")
    .custom(async (value) => {
      const review = await ReviewModel.findById(value);
      if (!review) {
        throw new Error(`No Review Found For This ID: ${value}`);
      }

      return true;
    }),
  validatorMiddleware
];

exports.deleteReviewValidator = [
  check("reviewId")
    .isMongoId()
    .withMessage("Invalid Review Id Format")
    .notEmpty()
    .withMessage("Review ID is Required!")
    .custom(async (reviewId, { req }) => {
      const Review = await ReviewModel.findById(reviewId);
      if (!Review) {
        throw new Error(`No Review Found For This ID: ${reviewId}`);
      }

      if (
        Review.user.toString() !== req.user._id.toString() &&
        req.user.role === "user"
      ) {
        throw new Error("You are not allowed to delete this review!");
      }
      return true;
    }),

  validatorMiddleware
];

const allowedFields = [
  "_id",
  "review",
  "rating",
  "product",
  "user",
  "createdAt",
  "updatedAt",
  "__v"
];

exports.getAllReviewsValidator = [
  check("page")
    .optional()
    .notEmpty()
    .withMessage("Page query cannot be empty.")
    .isNumeric()
    .withMessage("Page Must Be a Number!")
    .toInt()
    .custom((value) => {
      if (value < 1) {
        throw new Error("Page Must Be Greater Than 0!");
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
        throw new Error("Limit Must Be Greater Than 5!");
      }
      if (value > 30) {
        throw new Error("Limit Must Be Less Than Or Equal To 30!");
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
