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

//! @desk Add Specific Image To Array Of Images
//! @route POST /api/v1/products/images/:productId
//! @access Private/Admin | Manager
exports.addSpecificImageToArrayOfImages = async (req, res, next) => {
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

    if (product.images.length > 5) {
      return next(new APIError("Product Images Cannot Be More Than 5!", 400));
    }

    if (product.images.length + req.body.images.length > 5) {
      return next(new APIError("Product Images Cannot Be More Than 5!", 400));
    }

    product.images.push(...req.body.images);
    await product.save();

    res.status(200).json({
      status: "success",
      data: {
        product
      }
    });
  } catch (err) {
    next(err);
  }
};

//! @desc Update Specific Image From Array Of Images
//! @route PUT /api/v1/products/images/:productId
//! @access Private/Admin | Manager
exports.updateSpecificImageFromArrayOfImages = async (req, res, next) => {
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
    const imageId = req.body.imageId;
    if (!imageId) {
      return next(new APIError("No image id provided", 400));
    }
    const imageIndex = product.images.findIndex(
      (img) => img._id.toString() === imageId
    );
    if (imageIndex === -1) {
      return next(
        new APIError(`No image found for this image id: ${imageId}`, 404)
      );
    }

    product.images[imageIndex] = {
      ...req.body.images[0]
    };

    await product.save();

    res.status(200).json({
      status: "success",
      data: {
        product
      }
    });
  } catch (err) {
    next(err);
  }
};

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
          `The imagePublicId you entered ${notFoundImages.length === 1 ? "is" : "are"} not exist: ${[...new Set(notFoundImages.map((img) => img.imagePublicId))].join(", ")}`,
          400
        )
      );
    }

    const filteredImages = product.images.filter(
      (image) =>
        !bodyImages.some(
          (img) =>
            img.imagePublicId &&
            image.imagePublicId.split("/")[3] ===
              img.imagePublicId.split("/")[3]
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
