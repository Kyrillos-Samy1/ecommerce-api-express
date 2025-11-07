const sharp = require("sharp");
const APIError = require("../utils/apiError");

//! Resize single image
exports.resizeImageWithSharp =
  (imageName, width = 800, quality = 95) =>
  async (req, res, next) => {
    try {
      const file = req.file;
      if (!file) return next();

      const originalName = file.originalname.split(".")[0];

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
  (imageFieldName, width = 800, quality = 95) =>
  async (req, res, next) => {
    try {
      if (!req.files || !req.files[imageFieldName]) return next();

      req.body[imageFieldName] = [];

      const resizePromises = req.files[imageFieldName].map(async (file) => {
        const originalName = file.originalname.split(".")[0];

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
      console.log(req.body);
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
