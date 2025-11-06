const cloudinary = require("../config/cloudinaryConfig");
const APIError = require("../utils/apiError");

//! Process Image and Upload to Cloudinary
exports.uploadToCloudinary =
  (folder, filename, fieldImageName) => async (req, res, next) => {
    try {
      // استخدم الـ buffer المرتبط بالـ field name
      const optimizedBuffer = req[`${fieldImageName}Buffer`];
      if (!optimizedBuffer) {
        return next(
          new APIError(
            `No buffer found for ${fieldImageName}`,
            400,
            "Upload Error"
          )
        );
      }

      const publicId =
        typeof filename === "function" ? filename(req) : filename;

      const results = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder, public_id: publicId },
          (error, result) => {
            if (error)
              return reject(
                new APIError("Cloudinary Upload Failed", 500, "Upload Error")
              );
            resolve(result);
          }
        );

        uploadStream.end(optimizedBuffer);
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
        (img, index) =>
          new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder,
                public_id: `${img.tempFilename}-${index}`
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
exports.deleteFromCloudinary = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new APIError(error.message, 500, "Cloudinary Error");
  }
};
