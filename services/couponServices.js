const CouponModel = require("../models/couponModel");
const {
  createDocumnet,
  getAllDocuments,
  getDocumentById,
  updateOneDocument,
  deleteOneDocument
} = require("./handlersFactory");

//! @desc Create Coupon
//! @route POST /api/v1/coupons
//! @access Private/Admin | Manager
exports.createCoupon = createDocumnet(CouponModel, "Coupon");

//! @desc Get All Coupons With Pagination
//! @route GET /api/v1/coupons
//! @access Private/Admin | Manager
exports.getAllCoupons = getAllDocuments(
  CouponModel,
  "Coupons",
  [],
  ["coupon"],
  "couponId"
);

//! @desc Get Specific Coupon
//! @route GET /api/v1/coupons/:id
//! @access Private/Admin | Manager
exports.getCouponById = getDocumentById(
  CouponModel,
  "Coupon",
  [],
  "couponId",
  "-__v"
);

//! @desc Update Specific Coupon
//! @route PUT /api/v1/coupons/:id
//! @access Private/Admin | Manager
exports.updateCoupon = updateOneDocument(CouponModel, "Coupon", "couponId");

//! @desc Delete Specific Coupon
//! @route DELETE /api/v1/coupons/:id
//! @access Private/Admin | Manager
exports.deleteCoupon = deleteOneDocument(CouponModel, "Coupon", "couponId");
