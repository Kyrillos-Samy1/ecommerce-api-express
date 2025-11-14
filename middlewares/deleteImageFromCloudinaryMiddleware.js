const APIError = require("../utils/apiError");
const { deleteFromCloudinary } = require("./uplaodToCloudinaryMiddleware");

exports.deleteImageFromCloudinary = (Model, id) => async (req, res, next) => {
  try {
    const result = await Model.findById(req.params[id]);
    if (result.image.imagePublicId) {
      await deleteFromCloudinary(result.image.imagePublicId || "");
    }

    next();
  } catch (error) {
    next(new APIError(error.message, 500, "Cloudinary Error"));
  }
};

exports.deleteImagesFromCloudinary = async (req, res, next) => {
  try {
    if (req.body.images && req.body.images.length > 0 && !req.body.imageCover) {
      await Promise.all(
        req.body.images.map((image) => {
          if (image.imagePublicId) {
            return deleteFromCloudinary(image.imagePublicId || "");
          }

          return Promise.resolve();
        })
      );
    }

    if (req.body.imageCover && req.body.imageCover.imagePublicId) {
      await deleteFromCloudinary(req.body.imageCover.imagePublicId || "");
    }

    next();
  } catch (error) {
    next(new APIError(error.message, 500, "Cloudinary Error"));
  }
};

exports.removeImage = async (imagePublicId) => {
  if (imagePublicId) {
    await deleteFromCloudinary(imagePublicId);
  }
};

