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
      const filename = `${originalName}}`;

      const optimizedBuffer = await sharp(file.buffer)
        .resize(width)
        .toFormat("jpeg")
        .jpeg({ quality })
        .toBuffer();

      req[`${imageName}Buffer`] = optimizedBuffer;
      req.body[imageName] = { tempFilename: filename };

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
      if (!req.files || !req.files.length) return next();

      req.body[imageFieldName] = [];

      const resizePromises = req.files.map(async (file) => {
        const originalName = file.originalname.split(".")[0];
        const filename = `${originalName}}`;

        const optimizedBuffer = await sharp(file.buffer)
          .resize(width)
          .toFormat("jpeg")
          .jpeg({ quality })
          .toBuffer();

        req.body[imageFieldName].push({
          tempFilename: filename,
          buffer: optimizedBuffer
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
