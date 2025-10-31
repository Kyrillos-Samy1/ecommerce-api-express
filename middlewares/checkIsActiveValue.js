const CouponModel = require("../models/couponModel");
const APIError = require("../utils/apiError");

//! @desc Check The Value Of All Coupons
exports.checkIsActiveValue = async (req, res, next) => {
  try {
    await CouponModel.updateMany(
      { expireAt: { $lt: new Date().toISOString() }, isActive: true },
      { $set: { isActive: false } }
    );

    await CouponModel.updateMany(
      { expireAt: { $gt: new Date().toISOString() }, isActive: false },
      { $set: { isActive: true } }
    );

    next();
  } catch (error) {
    next(new APIError(error.message, 500, error.name));
  }
};