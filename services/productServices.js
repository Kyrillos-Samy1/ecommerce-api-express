const ProductModel = require("../models/productModel");
const APIError = require("../utils/apiError");
const {
  deleteOneDocument,
  updateOneDocument,
  getDocumentById,
  getAllDocuments,
  createDocumnet
} = require("./handlersFactory");

//! @desc Create Product
//! @route POST /api/v1/products
//! @access Private/Admin | Manager
exports.createProduct = createDocumnet(ProductModel, "Product");

//! @desc Get All Product With Pagination
//! @route GET /api/v1/products
//! @access Public
exports.getAllProducts = getAllDocuments(
  ProductModel,
  "Products",
  [
    { path: "brand", select: "-__v" },
    { path: "category", select: "-__v" },
    { path: "subCategory", select: "-__v" },
    {
      path: "reviews",
      select: "-__v",
      populate: {
        path: "user",
        select: "-__v"
      }
    }
  ],
  ["title", "description"],
  "productId"
);

//! @desc Get Specific Products
//! @route GET /api/v1/products/:id
//! @access Public
exports.getProductById = getDocumentById(
  ProductModel,
  "Product",
  [
    { path: "category", select: "-__v" },
    {
      path: "subCategory",
      select: "-__v"
    },
    {
      path: "brand",
      select: "-__v"
    },
    {
      path: "reviews",
      select: "-__v",
      populate: {
        path: "user",
        select: "-__v"
      }
    }
  ],
  "productId",
  "-__v"
);

//! @desc Update Specific Product
//! @route PUT /api/v1/products/:id
//! @access Private/Admin | Manager
exports.updateProduct = updateOneDocument(ProductModel, "Product", "productId");

//! @desc Delete Image From Array Of Images
//! @route DELETE /api/v1/products/images/:productId
//! @access Private/Admin | Manager
exports.deleteProductImage = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId);

    if (!product) {
      return next(
        new APIError(
          `No Product Found For This ID: ${req.params.productId}`,
          404
        )
      );
    }

    const bodyImages = req.body.images || [];
    if (!bodyImages.length) {
      return next(new APIError("No images provided for deletion", 400));
    }

    if (bodyImages.length > 5) {
      return next(new APIError("You cannot delete more than 5 images", 400));
    }

    if (bodyImages.some((img) => !img.imagePublicId)) {
      return next(new APIError("All images must have a imagePublicId", 400));
    }

    const notFoundImages = bodyImages.filter(
      (img) =>
        !product.images.some(
          (image) =>
            image.imagePublicId.split("/")[3] ===
            img.imagePublicId.split("/")[3]
        )
    );

    if (notFoundImages.length > 0) {
      return next(
        new APIError(
          `The ${
            notFoundImages.length === 1 ? "image" : "images"
          } you entered ${notFoundImages.length === 1 ? "is" : "are"} not exist: ${[
            ...new Set(notFoundImages.map((img) => img.imagePublicId))
          ].join(", ")}`,
          400
        )
      );
    }

    const filteredImages = product.images.filter(
      (image) =>
        !bodyImages.some(
          (img) =>
            img.tempFilename &&
            image.imagePublicId.split("/")[3] === img.tempFilename
        )
    );

    product.images = filteredImages;
    await product.save({ new: true, validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      data: {
        product
      }
    });
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//! @desc Delete Specific Product
//! @route DELETE /api/v1/products/:id
//! @access Private/Admin
exports.deleteProduct = deleteOneDocument(ProductModel, "Product", "productId");
