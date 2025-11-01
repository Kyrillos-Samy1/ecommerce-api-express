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
  updateReviewValidator
} = require("../utils/validators/reviewValidator");
const { cleanOrphanReviews } = require("../middlewares/cleanOrphanReviews");

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
    cleanOrphanReviews,
    createReview
  )
  .get(getAllReviewsValidator, cleanOrphanReviews, getAllReviews);

router
  .route("/:reviewId")
  .get(getReviewByIdValidator, cleanOrphanReviews, getReviewById)
  .put(
    protectRoutes,
    allowRoles("user"),
    updateReviewValidator,
    cleanOrphanReviews,
    updateReview
  )
  .delete(
    protectRoutes,
    allowRoles("user", "manager", "admin"),
    cleanOrphanReviews,
    deleteReview
  );

module.exports = router;
