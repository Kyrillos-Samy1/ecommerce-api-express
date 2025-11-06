const cloudinary = require("../config/cloudinaryConfig");
const APIError = require("../utils/apiError");

//! Process Image and Upload to Cloudinary
exports.uploadToCloudinary =
  (folder, fieldImageName) => async (req, res, next) => {
    try {
      if (!req.file) {
        return next(new APIError("No file uploaded", 400, "Upload Error"));
      }

      const results = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder, public_id: req.body[fieldImageName].tempFilename },
          (error, result) => {
            if (error)
              return reject(
                new APIError("Cloudinary Upload Failed", 500, "Upload Error")
              );
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id
            });
          }
        );
        uploadStream.end(req.file.buffer);
      });

      req.body[fieldImageName] = {
        url: results.secure_url,
        imagePublicId: results.public_id
      };

      next();
    } catch (error) {
      next(new APIError(error.message, 500, "Cloudinary Error"));
    }
  };

//! Process Array of Images and Upload to Cloudinary
exports.uploadToCloudinaryArrayOfImages =
  (folder, fieldImageName) => async (req, res, next) => {
    try {
      const imagesData = req.body[fieldImageName];
      if (!imagesData || !Array.isArray(imagesData) || imagesData.length === 0)
        return next(
          new APIError("No images found for upload", 400, "Upload Error")
        );

      const uploadPromises = imagesData.map(
        (img) =>
          new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder,
                public_id: `${img.tempFilename}`
              },
              (error, result) => {
                if (error)
                  return reject(
                    new APIError(
                      "Cloudinary Upload Failed",
                      500,
                      "Upload Error"
                    )
                  );
                resolve({
                  url: result.secure_url,
                  imagePublicId: result.public_id
                });
              }
            );
            uploadStream.end(img.buffer);
          })
      );

      const uploadedImages = await Promise.all(uploadPromises);
      req.body[fieldImageName] = uploadedImages;
      next();
    } catch (error) {
      next(new APIError(error.message, 500, "Cloudinary Error"));
    }
  };

//! Delete from Cloudinary
exports.deleteFromCloudinary = (publicId) => async (req, res, next) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    next();
  } catch (error) {
    next(new APIError(error.message, 500, "Cloudinary Error"));
  }
};

//! Delete Array of Images from Cloudinary
exports.deleteArrayOfImagesFromCloudinary =
  (publicIds) => async (req, res, next) => {
    try {
      await Promise.all(
        publicIds.map((publicId) => cloudinary.uploader.destroy(publicId))
      );
    } catch (error) {
      next(new APIError(error.message, 500, "Cloudinary Error"));
    }
  };
