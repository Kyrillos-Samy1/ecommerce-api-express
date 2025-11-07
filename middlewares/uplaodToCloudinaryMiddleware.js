const cloudinary = require("../config/cloudinaryConfig");
const APIError = require("../utils/apiError");

//! Upload Image to Cloudinary
const uploadImageToCloudinary = async (folder, fileType, buffer) =>
  await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: fileType
      },
      (error, result) => {
        if (error)
          return reject(
            new APIError("Cloudinary Upload Failed", 500, "Upload Error")
          );
        resolve({
          url: result.secure_url,
          imagePublicId: result.public_id
        });
      }
    );
    uploadStream.end(buffer);
  });

//! Process Image and Upload to Cloudinary
exports.uploadToCloudinary =
  (folder, fieldImageName) => async (req, res, next) => {
    try {
      const imagesData = req.body[fieldImageName];
      if (!imagesData || imagesData.length === 0) {
        return next(
          new APIError("No images found for upload", 400, "Upload Error")
        );
      }

      if (req.files) {
        const result = await uploadImageToCloudinary(
          folder,
          imagesData[0].tempFilename,
          imagesData[0].newBuffer
        );
        req.body[fieldImageName] = result;
      }

      if (req.file) {
        const result = await uploadImageToCloudinary(
          folder,
          req.body[fieldImageName].tempFilename,
          req.body[fieldImageName].buffer
        );
        req.body[fieldImageName] = result;
      }

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
      if (!imagesData || imagesData.length === 0) {
        console.log(
          "No images found for upload",
          req.body[fieldImageName],
          fieldImageName,
          req.body
        );
        return next(
          new APIError("No images found for upload", 400, "Upload Error")
        );
      }

      const uploadPromises = imagesData.map(
        (img) =>
          new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder,
                public_id: img.tempFilename
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
            uploadStream.end(img.newBuffer);
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
