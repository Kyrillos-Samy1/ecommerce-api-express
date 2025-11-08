const { default: slugify } = require("slugify");
const sharp = require("sharp");

const APIError = require("../utils/apiError");
const ProductModel = require("../models/productModel");

const refacorFileName = (name) =>
  name
    .replace(/[%$#@! ]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/&/g, "and");

//! Resize single image
exports.resizeImageWithSharp =
  (imageName, width, quality, paramId, Model, docName) =>
  async (req, res, next) => {
    try {
      const file = req.file;
      if (!file) return next();

      const result = await Model.findById(req.params[paramId] || req.user._id);

      if (!result) {
        req.validationMessage = `No ${docName} Found For This ID: ${req.params.brandId}`;
        return true;
      }

      const name =
        refacorFileName(result.name) || refacorFileName(req.body.name);

      const originalName = slugify(`${name}-logo-${docName}`.toLowerCase());

      const optimizedBuffer = await sharp(file.buffer)
        .resize(width)
        .toFormat("jpeg")
        .jpeg({ quality })
        .toBuffer();

      req.body[imageName] = {
        buffer: optimizedBuffer,
        tempFilename: originalName
      };

      next();
    } catch (err) {
      next(
        new APIError(
          `Image processing failed: ${err.message}`,
          500,
          "SharpError"
        )
      );
    }
  };

//! Resize multiple images
exports.resizeMultipleImagesWithSharp =
  (imageFieldName, width, quality, paramId, Model, docName) =>
  async (req, res, next) => {
    try {
      if (!req.files || !req.files[imageFieldName]) return next();

      const product = await ProductModel.findById(req.params.productId).select(
        "images title"
      );

      if (!product) {
        return next(
          new APIError(
            `No ${docName} Found For This ID: ${req.params.productId}`,
            404
          )
        );
      }

      req.body[imageFieldName] = [];

      const name =
        refacorFileName(product.title) || refacorFileName(req.body.title);

      const originalName = slugify(`${name}-logo-${docName}`.toLowerCase());

      const existingImagesCount = Array.isArray(product.images)
        ? product.images.length
        : 0;

      if (
        req.method === "POST" &&
        existingImagesCount + req.files[imageFieldName].length > 5
      ) {
        return next(
          new APIError(
            `Product Images Cannot Be More Than 5! You Can Add Just: ${
              5 - existingImagesCount
            }`,
            400
          )
        );
      }

     const optimizedImages = await Promise.all(
       req.files[imageFieldName].map(async (file, index) => {
         let originalNameForImages = originalName;

         if (imageFieldName === "images" && req.method === "POST") {
           originalNameForImages = `${originalName}-${existingImagesCount + 1 + index}`;
         }

         if (imageFieldName === "images" && req.method === "PATCH") {
           const imgIndex = product.images.findIndex(
             (img) => img._id.toString() === req.body.imageId
           );

           if (imgIndex !== -1) {
             originalNameForImages = `${originalName}-${imgIndex + 1}`;
           }
         }

         const optimizedBuffer = await sharp(file.buffer)
           .resize(width)
           .toFormat("jpeg")
           .jpeg({ quality })
           .toBuffer();

         return {
           tempFilename:
             imageFieldName === "images" ? originalNameForImages : originalName,
           newBuffer: optimizedBuffer
         };
       })
     );

     req.body[imageFieldName] = optimizedImages;
     next();
    } catch (err) {
      next(
        new APIError(
          `Image processing failed: ${err.message}`,
          500,
          "SharpError"
        )
      );
    }
  };
