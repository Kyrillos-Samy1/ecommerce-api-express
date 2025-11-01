// const asyncHandler = require("express-async-handler");
const ReviewModel = require("../models/reviewModel");

const {
  deleteOneDocument,
  updateOneDocument,
  getDocumentById,
  getAllDocuments,
  createDocumnet
} = require("./handlersFactory");

exports.setLoggedUserIdToBody = (req, res, next) => {
  if (req.user) req.body.user = req.user._id;
  next();
};

//! @desc Create Review
//! @route POST /api/v1/reviews
//! @access Private/Protected/User
exports.createReview = createDocumnet(ReviewModel, "Review");

//! @desc Get All Reviews With Pagination
//! @route GET /api/v1/reviews
//! @access Public
exports.getAllReviews = getAllDocuments(
  ReviewModel,
  "Reviews",
  ["user"],
  [{ path: "user", select: "-__v" }],
  "productId"
);

//! @desc Get Specific Reviews
//! @route GET /api/v1/reviews/:id
//! @access Public
exports.getReviewById = getDocumentById(
  ReviewModel,
  "Review",
  [{ path: "user", select: "-__v" }],
  "reviewId",
  "-__v"
);

//! @desc Update Specific Review
//! @route PUT /api/v1/reviews/:id
//! @access Private/Protected/User
exports.updateReview = updateOneDocument(ReviewModel, "Review", "reviewId");

//! @desc Delete Specific Review
//! @route DELETE /api/v1/reviews/:id
//! @access Private/Protected/User
exports.deleteReview = deleteOneDocument(ReviewModel, "Review", "reviewId");
