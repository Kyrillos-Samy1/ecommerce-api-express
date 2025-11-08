const { check, body } = require("express-validator");
const mongoose = require("mongoose");
const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");
const CategoryModel = require("../../models/categoryModel");
const SubCategoryModel = require("../../models/subCategoryModel");
const BrandModel = require("../../models/brandModel");
const ProductModel = require("../../models/productModel");
const APIError = require("../apiError");

exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Product Title is Required!")
    .isString()
    .withMessage("Product Title Must Be a String!")
    .isLength({ min: 3 })
    .withMessage("Too Short Product Title!")
    .isLength({ max: 100 })
    .withMessage("Too Long Product Title!")
    .custom(async (value) => {
      const existingProduct = await ProductModel.findOne({ title: value });
      if (existingProduct) {
        throw new Error("Product title Already Uloaded!");
      }
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Product Description is Required!")
    .isString()
    .withMessage("Product Description Must Be a String!")
    .isLength({ min: 20 })
    .withMessage("Too Short Product Description!")
    .isLength({ max: 500 })
    .withMessage("Too Long Product Description!"),
  check("quantity")
    .notEmpty()
    .withMessage("Product Quantity is Required!")
    .isNumeric()
    .withMessage("Product Quantity Must Be a Number!"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product Sold Must Be a Number!"),
  check("price")
    .notEmpty()
    .withMessage("Product Price is Required!")
    .isNumeric()
    .withMessage("Product Price Must Be a Number!")
    .isLength({ min: 1, max: 7 })
    .withMessage("Product Price Must Be Between 1 and 7 Digits!"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product Price After Discount Must Be a Number!")
    .toFloat()
    .isLength({ min: 1, max: 7 })
    .withMessage("Product Price After Discount Must Be Between 1 and 7 Digits!")
    .custom((value, { req }) => {
      if (value && value >= req.body.price) {
        throw new Error(
          "Product Price After Discount Must Be Less Than Price!"
        );
      }
      return true;
    }),
  check("colors")
    .optional()
    .isArray()
    .withMessage("Product Colors Must Be an Array!")
    .custom((arrayOfColors) => {
      if (arrayOfColors.length === 0) {
        throw new Error("Product Colors Cannot Be an Empty Array!");
      }
      const lowerCasedColors = arrayOfColors.map((color) =>
        color.toLowerCase()
      );

      if (new Set(lowerCasedColors).size !== lowerCasedColors.length) {
        const duplicates = lowerCasedColors.filter(
          (color, index) => lowerCasedColors.indexOf(color) !== index
        );
        throw new Error(
          `Duplicate ${duplicates.length === 1 ? `${duplicates.length} color is not allowed` : `${duplicates.length} colors are not allowed`}: ${[...new Set(duplicates)].join(", ")}`
        );
      }

      if (arrayOfColors.some((color) => typeof color !== "string")) {
        throw new Error("All colors must be strings.");
      }
      return true;
    }),
  check("sizes")
    .optional()
    .isArray()
    .withMessage("Product Sizes Must Be an Array!")
    .custom((arrayOfSizes) => {
      if (arrayOfSizes.length === 0) {
        throw new Error("Product Sizes Cannot Be an Empty Array!");
      }
      const lowerCasedSizes = arrayOfSizes.map((size) => size.toLowerCase());

      if (new Set(lowerCasedSizes).size !== lowerCasedSizes.length) {
        const duplicates = lowerCasedSizes.filter(
          (size, index) => lowerCasedSizes.indexOf(size) !== index
        );
        throw new Error(
          `Duplicate ${
            duplicates.length === 1
              ? `${duplicates.length} size`
              : `${duplicates.length} sizes`
          } are not allowed: ${[...new Set(duplicates)].join(", ")}`
        );
      }
      if (arrayOfSizes.some((size) => typeof size !== "string")) {
        throw new Error("All sizes must be strings.");
      }
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("Product Category is Required!")
    .isMongoId()
    .withMessage("Product Category Must Be a Valid MongoDB ID!")
    .custom((categoryId) =>
      CategoryModel.findById(categoryId).then((category) => {
        if (!category) {
          throw new Error("Category Not Found!");
        }
      })
    ),
  check("subCategory")
    .notEmpty()
    .withMessage("Product SubCategory is Required!")
    .isArray()
    .withMessage("Product SubCategory Must Be an Array!")
    .custom((arrayOfSubCategory) => {
      //! Check if the array is empty
      if (arrayOfSubCategory.length === 0) {
        throw new Error("Product SubCategory Cannot Be an Empty Array!");
      }
      //! Check for duplicate subCategory IDs
      const lowerCasedSubCategories = arrayOfSubCategory.map((id) =>
        id.toLowerCase()
      );
      if (
        new Set(lowerCasedSubCategories).size !== lowerCasedSubCategories.length
      ) {
        const duplicates = lowerCasedSubCategories.filter(
          (SubCategory, index) =>
            arrayOfSubCategory.indexOf(SubCategory) !== index
        );
        throw new Error(
          `Duplicate ${
            duplicates.length === 1
              ? `${duplicates.length} subCategory ID`
              : `${duplicates.length} subCategory IDs`
          } are not allowed: ${[...new Set(duplicates)].join(", ")}`
        );
      }
      return true;
    })
    //! Check if each subCategory ID is valid
    .custom((subCategoryIds) => {
      const invalidIDs = subCategoryIds.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );
      if (invalidIDs.length > 0) {
        throw new Error(`Invalid subCategory IDs: ${invalidIDs.join(", ")}`);
      }
      return true;
    })
    //! Check if each subCategory ID exists in the database
    .custom(async (subCategoryIds) => {
      const filteredSubCategoriesIDs = await SubCategoryModel.find({
        _id: { $in: subCategoryIds }
      });

      const foundIds = filteredSubCategoriesIDs.map((subCategory) =>
        subCategory._id.toString()
      );

      const missingIds = subCategoryIds.filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        throw new Error(`SubCategories Not Found: ${missingIds.join(", ")}`);
      }

      return true;
    })
    //! Check if each subCategory ID belongs to the selected category or not
    .custom(async (subCategoryIds, { req }) => {
      const subCategoriesBelontToCategory = await SubCategoryModel.find({
        _id: { $in: subCategoryIds },
        category: req.body.category
      });

      const foundIds = subCategoriesBelontToCategory.map((subCategory) =>
        subCategory._id.toString()
      );
      const missingIds = subCategoryIds.filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        throw new Error(
          `{${missingIds.join(", ")}} => These SubCategories Were Not Found For The Selected Category: ${req.body.category}`
        );
      }
    }),
  check("brand")
    .notEmpty()
    .withMessage("Product Brand is Required!")
    .isMongoId()
    .withMessage("Product Brand Must Be a Valid MongoDB ID!")
    .custom((brandId) =>
      BrandModel.findById(brandId).then((brand) => {
        if (!brand) {
          throw new Error("Brand Not Found!");
        }
      })
    ),
  validatorMiddleware
];

exports.updateProductValidator = [
  check("productId")
    .isMongoId()
    .withMessage("Invalid Product Id Format")
    .notEmpty()
    .withMessage("Product ID is Required!")
    .custom(async (productId) => {
      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new Error(`No Product Found For This ID: ${productId}`);
      }
    }),
  check("title")
    .optional()
    .isString()
    .withMessage("Product Title Must Be a String!")
    .isLength({ min: 3 })
    .withMessage("Too Short Product Title!")
    .isLength({ max: 100 })
    .withMessage("Too Long Product Title!")
    .custom(async (value, { req }) => {
      const existingProduct = await ProductModel.findOne({
        title: value,
        _id: { $eq: req.params.productId }
      });
      if (existingProduct) {
        throw new Error(
          `${value} title Already Uloaded For This ID: ${req.params.productId}`
        );
      }
      return true;
    })
    .custom(async (value, { req }) => {
      const product = await ProductModel.findOne({
        title: value,
        _id: { $ne: req.params.productId }
      });

      if (product) {
        throw new Error(`${value} Name Already Uloaded For Another Product!`);
      }

      return true;
    }),
  check("description")
    .optional()
    .isString()
    .withMessage("Product Description Must Be a String!")
    .isLength({ min: 20 })
    .withMessage("Too Short Product Description!")
    .isLength({ max: 500 })
    .withMessage("Too Long Product Description!"),
  check("quantity")
    .optional()
    .isNumeric()
    .withMessage("Product Quantity Must Be a Number!"),
  check("price")
    .optional()
    .isNumeric()
    .withMessage("Product Price Must Be a Number!")
    .isLength({ min: 1, max: 7 })
    .withMessage("Product Price Must Be Between 1 and 7 Digits!"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product Price After Discount Must Be a Number!")
    .toFloat()
    .isLength({ min: 1, max: 7 })
    .withMessage("Product Price After Discount Must Be Between 1 and 7 Digits!")
    .custom((value, { req }) => {
      if (value && value >= req.body.price) {
        throw new Error(
          "Product Price After Discount Must Be Less Than Price!"
        );
      }
      return true;
    }),
  check("colors")
    .optional()
    .isArray()
    .withMessage("Product Colors Must Be an Array!")
    .custom((arrayOfColors) => {
      if (arrayOfColors.length === 0) {
        throw new Error("Product Colors Cannot Be an Empty Array!");
      }
      const lowerCasedColors = arrayOfColors.map((color) =>
        color.toLowerCase()
      );

      if (new Set(lowerCasedColors).size !== lowerCasedColors.length) {
        const duplicates = lowerCasedColors.filter(
          (color, index) => lowerCasedColors.indexOf(color) !== index
        );
        throw new Error(
          `Duplicate ${
            duplicates.length === 1
              ? `${duplicates.length} color`
              : `${duplicates.length} colors`
          } are not allowed: ${[...new Set(duplicates)].join(", ")}`
        );
      }

      if (arrayOfColors.some((color) => typeof color !== "string")) {
        throw new Error("All colors must be strings.");
      }
      return true;
    }),
  check("sizes")
    .optional()
    .isArray()
    .withMessage("Product Sizes Must Be an Array!")
    .custom((arrayOfSizes) => {
      if (arrayOfSizes.length === 0) {
        throw new Error("Product Sizes Cannot Be an Empty Array!");
      }
      const lowerCasedSizes = arrayOfSizes.map((size) => size.toLowerCase());

      if (new Set(lowerCasedSizes).size !== lowerCasedSizes.length) {
        const duplicates = lowerCasedSizes.filter(
          (size, index) => lowerCasedSizes.indexOf(size) !== index
        );
        throw new Error(
          `Duplicate ${
            duplicates.length === 1
              ? `${duplicates.length} size`
              : `${duplicates.length} sizes`
          } are not allowed: ${[...new Set(duplicates)].join(", ")}`
        );
      }
      if (arrayOfSizes.some((size) => typeof size !== "string")) {
        throw new Error("All sizes must be strings.");
      }
      return true;
    }),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product Sold Must Be a Number!"),
  check("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid Product Id Format")
    .notEmpty()
    .withMessage("Product Category is Required!")
    .custom((categoryId) =>
      CategoryModel.findById(categoryId).then((category) => {
        if (!category) {
          throw new Error("Invalid Category Id!");
        }
      })
    ),
  check("subCategory")
    .optional()
    .isArray()
    .withMessage("Product SubCategory Must Be an Array!")
    .custom((arrayOfSubCategory) => {
      //! Check if the array is empty
      if (arrayOfSubCategory.length === 0) {
        throw new Error("Product SubCategory Cannot Be an Empty Array!");
      }
      //! Check for duplicate subCategory IDs
      const lowerCasedSubCategories = arrayOfSubCategory.map((id) =>
        id.toLowerCase()
      );
      if (
        new Set(lowerCasedSubCategories).size !== lowerCasedSubCategories.length
      ) {
        const duplicates = lowerCasedSubCategories.filter(
          (subCategory, index) =>
            lowerCasedSubCategories.indexOf(subCategory) !== index
        );
        throw new Error(
          `Duplicate ${
            duplicates.length === 1
              ? `${duplicates.length} size`
              : `${duplicates.length} sizes`
          } are not allowed: ${[...new Set(duplicates)].join(", ")}`
        );
      }
      return true;
    })
    //! Check if each subCategory ID  is valid
    .custom((subCategoryIds) => {
      const invalidIDs = subCategoryIds.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );
      if (invalidIDs.length > 0) {
        throw new Error(`Invalid subCategory IDs: ${invalidIDs.join(", ")}`);
      }
      return true;
    })
    //! Check if each subCategory ID exists in the database
    .custom(async (subCategoryIds) => {
      const foundSubCategoriesIDs = await SubCategoryModel.find({
        _id: { $in: subCategoryIds }
      });

      const foundIds = foundSubCategoriesIDs.map((subCategory) =>
        subCategory._id.toString()
      );

      const missingIds = subCategoryIds.filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        throw new Error(`SubCategories Not Found: ${missingIds.join(", ")}`);
      }

      return true;
    })
    //! Check if each subCategory ID belongs to the selected category or not
    .custom(async (subCategoryIds, { req }) => {
      const subCategoriesBelontToCategory = await SubCategoryModel.find({
        _id: { $in: subCategoryIds },
        category: req.body.category
      });

      const foundIds = subCategoriesBelontToCategory.map((subCategory) =>
        subCategory._id.toString()
      );
      const missingIds = subCategoryIds.filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        throw new Error(
          `{${missingIds.join(", ")}} => These SubCategories Were Not Found For The Selected Category: ${req.body.category}`
        );
      }
    }),
  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Product Brand Must Be a Valid MongoDB ID!")
    .custom((brandId) =>
      BrandModel.findById(brandId).then((brand) => {
        if (!brand) {
          throw new Error("Brand Not Found!");
        }
      })
    ),
  check("images").custom(async (arrayOfImages, { req }) => {
    if (req.files.images) {
      return new APIError(
        `Error updating product: You can't update images with this route!`,
        400,
        "Bad Request"
      );
    }
  }),
  check("imageCover").optional(),
  validatorMiddleware
];

exports.deleteProductValidator = [
  check("productId")
    .isMongoId()
    .withMessage("Invalid Product Id Format")
    .notEmpty()
    .withMessage("Product ID is Required!")
    .custom(async (productId) => {
      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new Error(`No Product Found For This ID: ${productId}`);
      }
    }),
  check("images").custom(async (arrayOfImages, { req }) => {
    if (arrayOfImages.length === 0) {
      throw new Error("Product Images Cannot Be an Empty Array!");
    }

    if (arrayOfImages.length > 5) {
      throw new Error("Product Images Cannot Be More Than 5!");
    }

    const arrayOfImagePublicIdsFromBody = arrayOfImages.map(
      (image) => image.imagePublicId.split("/")[3]
    );

    const product = await ProductModel.findById(req.params.productId);

    if (!product) {
      throw new Error(`No Product Found For This ID: ${req.params.productId}`);
    }

    const duplicates = arrayOfImagePublicIdsFromBody.filter(
      (image, index) => arrayOfImagePublicIdsFromBody.indexOf(image) !== index
    );
    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate ${
          duplicates.length === 1
            ? `${duplicates.length} image`
            : `${duplicates.length} images`
        } are not allowed: ${[...new Set(duplicates)].join(", ")}`
      );
    }

    const arrayOfImagePublicIdsFromProduct = product.images.map(
      (image) => image.imagePublicId.split("/")[3]
    );

    if (product.imageCover)
      arrayOfImagePublicIdsFromProduct.push(
        product.imageCover.imagePublicId.split("/")[3]
      );

    const forgetToAddImages = arrayOfImagePublicIdsFromProduct.filter(
      (imagePublicId) => !arrayOfImagePublicIdsFromBody.includes(imagePublicId)
    );

    if (forgetToAddImages.length > 0) {
      throw new Error(
        `Forget To Add ${
          forgetToAddImages.length === 1 ? "This Image" : "These Images"
        } To Delete All From Cloudinary: ${forgetToAddImages.join(", ")}`
      );
    }

    return true;
  }),
  validatorMiddleware
];

exports.getProductByIdValidator = [
  check("productId")
    .isMongoId()
    .withMessage("Invalid Product Id Format")
    .notEmpty()
    .withMessage("Product ID is Required!")
    .custom(async (productId) => {
      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new Error(`No Product Found For This ID: ${productId}`);
      }
    }),
  validatorMiddleware
];

const allowedFields = [
  "_id",
  "title",
  "slug",
  "description",
  "quantity",
  "sold",
  "price",
  "priceAfterDiscount",
  "colors",
  "sizes",
  "imageCover",
  "images",
  "category",
  "subCategory",
  "brand",
  "ratingsAverage",
  "ratingsQuantity",
  "createdAt",
  "updatedAt",
  "__v"
];

exports.getAllProductsValidator = [
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
    .isString()
    .trim()
    .withMessage("Search must be a string")
    .notEmpty()
    .withMessage("Search query cannot be empty.")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Search can only contain letters, numbers, and spaces"),
  validatorMiddleware
];

//*================================================= For Images & Image Cover ==================================================

exports.checkImagesInFilesForUpdateProductValidator = [
  body().custom((_, { req }) => {
    if (req.files && req.files.images) {
      req.validationMessages = "You can't update images with this route!";
      return true;
    }

    return true;
  }),
  (req, res, next) => {
    if (req.validationMessages) {
      return next(new APIError(req.validationMessages, 400, "ValidationError"));
    }
    next();
  }
];

exports.AddSpecificImageToArrayOfImagesValidator = [
  check("images").custom((arrayOfImages, { req }) => {
    if (arrayOfImages.length === 0) {
      throw new Error("Product Images Cannot Be an Empty Array!");
    }

    if (arrayOfImages.length > 5) {
      throw new Error("Product Images Cannot Be More Than 5!");
    }

    if (req.files.imageCover) {
      req.validationMessages = "You can't update image cover with this route!";
      return true;
    }

    return true;
  }),
  validatorMiddleware
];

exports.updateSpecificImageFromArrayOfImagesValidator = [
  body().custom(async (_, { req }) => {
    const product = await ProductModel.findById(req.params.productId);

    if (!product) {
      req.validationMessages = `No Product Found For This ID: ${req.params.productId}`;
      return true;
    }

    const imageId = req.body.imageId;

    if (!imageId) {
      req.validationMessages = "No image id provided";
      return true;
    }

    const imageIndex = product.images.findIndex(
      (img) => img._id.toString() === imageId
    );

    if (imageIndex === -1) {
      req.validationMessages = `No image found for this image id: ${imageId}`;
      return true;
    }

    return true;
  }),
  (req, res, next) => {
    if (req.validationMessages) {
      return next(new APIError(req.validationMessages, 400, "ValidationError"));
    }
    next();
  }
];

exports.updateArrayOfImagesValidator = [
  check("images")
    .optional()
    .custom(async (arrayOfImages, { req }) => {
      if (arrayOfImages.length === 0) {
        req.validationMessages = "Product Images Cannot Be an Empty Array!";
        return true;
      }

      if (req.body.imageCover) {
        req.validationMessages =
          "You can't update image cover with this route!";
        return true;
      }

      const product = await ProductModel.findById(req.params.productId);

      if (!product) {
        req.validationMessages = `No Product Found For This ID: ${req.params.productId}`;
        return true;
      }

      const imageId = req.body.imageId;
      if (!imageId) {
        req.validationMessages = "No image id provided";
        return true;
      }

      if (
        product.images.length > 5 ||
        product.images.length + req.body.images.length > 5
      ) {
        req.validationMessages = "Product Images Cannot Be More Than 5!";
        return true;
      }

      const image = product.images.find(
        (img) => img._id.toString() === imageId
      );

      if (!image) {
        req.validationMessages = `No image found for this image id: ${imageId}`;
        return true;
      }

      if (arrayOfImages.length > 5) {
        req.validationMessages = "Product Images Cannot Be More Than 5!";
        return true;
      }

      if (arrayOfImages.length === 0) {
        req.validationMessages = "Product Images Cannot Be an Empty Array!";
        return true;
      }

      return true;
    }),
  (req, res, next) => {
    if (req.validationMessages) {
      return next(new APIError(req.validationMessages, 400, "ValidationError"));
    }
    next();
  }
];

exports.checkImageCoverInFilesForUpdateAndAddImagesValidator = [
  body().custom((_, { req }) => {
    if (req.files && req.files.imageCover) {
      req.validationMessages = `You can't ${req.method === "POST" ? "add" : "update"} image Cover with this route!`;
      return true;
    }

    return true;
  }),
  (req, res, next) => {
    if (req.validationMessages) {
      return next(new APIError(req.validationMessages, 400, "ValidationError"));
    }
    next();
  }
];

exports.checkImageCoverFoundValidatorForUpdateValidator = [
  body().custom((_, { req }) => {
    if (!req.files.imageCover) {
      throw new Error("Product Image Cover Not Found!");
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
