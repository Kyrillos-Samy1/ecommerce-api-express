const sharp = require("sharp");
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

//! Image Processing Using Sharp
exports.resizeProductImage = async (req, res, next) => {
  if (!req.files) return next();

  if (req.files.imageCover) {
    req.body.imageCover = `product-${Date.now()}-cover.webp`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("webp")
      .webp({ quality: 95 })
      .toFile(`uploads/products/${req.body.imageCover}`);
  }

  if (req.files.images) {
    req.body.images = [];
    try {
      await Promise.all(
        req.files.images.map(async (file, index) => {
          const filename = `product-${Date.now()}-${index + 1}.webp`;
          await sharp(file.buffer)
            .resize(600, 600)
            .toFormat("webp")
            .webp({ quality: 90 })
            .toFile(`uploads/products/${filename}`);

          req.body.images.push(filename);
        })
      );
    } catch (err) {
      return next(new APIError(`Error processing images: ${err}`, 500));
    }
  }

  next();
};

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

exports.updateArrayOfImages = (productId) => async (req, res, next) => {
  try {
    const product = await ProductModel.findById(productId);
    if (!product) {
      return next(
        new APIError(`No Product Found For This ID: ${productId}`, 404)
      );
    }
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { images: req.body.images },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      message: "Product Images Updated Successfully",
      data: updatedProduct
    });
  } catch (err) {
    next(new APIError(err.message, 500));
  }
};

//! @desc Delete Specific Product
//! @route DELETE /api/v1/products/:id
//! @access Private/Admin
exports.deleteProduct = deleteOneDocument(ProductModel, "Product", "productId");
