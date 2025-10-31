const express = require("express");
const { protectRoutes, allowRoles } = require("../services/authServices");
const {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  setLoggedUserIdToBody
} = require("../services/reviewServices");

const {
  setParamIdToBodyAndUserId
} = require("../middlewares/setParamIdToBody");
const {
  createReviewValidator,
  getAllReviewsValidator,
  getReviewByIdValidator,
  updateReviewValidator,
  deleteReviewValidator
} = require("../utils/validators/reviewValidator");

//! mergeParams: Allow Us To Access Params From Parent Router
//! Ex: We Need To Access reviewId From Review Router
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    protectRoutes,
    allowRoles("user"),
    setParamIdToBodyAndUserId("productId", "product", "user"),
    createReviewValidator,
    setLoggedUserIdToBody,
    createReview
  )
  .get(getAllReviewsValidator, getAllReviews);

router
  .route("/:reviewId")
  .get(getReviewByIdValidator, getReviewById)
  .put(protectRoutes, allowRoles("user"), updateReviewValidator, updateReview)
  .delete(
    protectRoutes,
    allowRoles("user", "manager", "admin"),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
