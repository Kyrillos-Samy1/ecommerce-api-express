const APIError = require("../utils/apiError");
const { deleteFromCloudinary } = require("./uplaodToCloudinaryMiddleware");

exports.deleteImageFromCloudinary =
  (Model, id) => async (req, res, next) => {
    try {
      const result = await Model.findById(req.params[id]);
      if (result.image.imagePublicId) {
        await deleteFromCloudinary(result.image.imagePublicId);
      }
      next();
    } catch (error) {
      next(new APIError(error.message, 500, "Cloudinary Error"));
    }
  };
