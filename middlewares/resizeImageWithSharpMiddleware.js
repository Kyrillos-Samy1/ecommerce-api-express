const sharp = require("sharp");
const APIError = require("../utils/apiError");

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

      const originalName = `${name}-logo-${docName}`.toLowerCase();

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

      const result = await Model.findById(req.params[paramId]);

      if (!result) {
        req.validationMessage = `No ${docName} Found For This ID: ${req.params.brandId}`;
        return true;
      }

      req.body[imageFieldName] = [];

      const name =
        refacorFileName(result.title) || refacorFileName(req.body.title);

      const resizePromises = req.files[imageFieldName].map(async (file) => {
        const originalName = `${name}-logo-${docName}`.toLowerCase();

        const optimizedBuffer = await sharp(file.buffer)
          .resize(width)
          .toFormat("jpeg")
          .jpeg({ quality })
          .toBuffer();

        req.body[imageFieldName].push({
          tempFilename: originalName,
          newBuffer: optimizedBuffer
        });
      });

      await Promise.all(resizePromises);
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
