const ReviewModel = require("../models/reviewModel");
const UserModel = require("../models/userModel");
const APIError = require("../utils/apiError");

//! @desc Delete all reviews if their user IDs no longer exist
exports.cleanOrphanReviews = async (req, res, next) => {
  try {
    const userIds = await UserModel.distinct("_id");

    const result = await ReviewModel.deleteMany({
      user: { $nin: userIds }
    });

    console.log(`${result.deletedCount} orphan reviews deleted.`);
    next();
  } catch (err) {
    next(new APIError("Error deleting orphan reviews", 500, err.name));
  }
};
