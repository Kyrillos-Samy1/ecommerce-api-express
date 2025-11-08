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

//! @desc Delete Specific Product
//! @route DELETE /api/v1/products/:id
//! @access Private/Admin
exports.deleteProduct = deleteOneDocument(ProductModel, "Product", "productId");

//*===================================================== For Images ==================================================

//! @desk Add Specific Image To Array Of Images
//! @route POST /api/v1/products/images/:productId
//! @access Private/Admin | Manager
exports.addSpecificImageToArrayOfImages = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId);

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
//! @route PATCH /api/v1/products/images/:productId
//! @access Private/Admin | Manager
exports.updateSpecificImageFromArrayOfImages = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId);

    const imageId = req.body.imageId;

    const imageIndex = product.images.findIndex(
      (img) => img._id.toString() === imageId
    );

    const oldImage = product.images[imageIndex];

    product.images[imageIndex] = {
      _id: oldImage._id,
      url: req.body.images[0].url,
      imagePublicId: req.body.images[0].imagePublicId,
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
exports.deleteSpecificImagesFromArrayOfImages = async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId);

    const bodyImages = req.body.images || [];

    if (bodyImages.some((img) => !img.imagePublicId)) {
      return next(new APIError("All images must have a imagePublicId", 400));
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
