const ProductModel = require("../models/productModel");
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
