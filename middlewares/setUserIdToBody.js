//! @desc Add User Id To Body Middleware
exports.setUserIdToBody = (req, _res, next) => {
  if (req.body.userId) req.body.userId = req.user._id;
  if (req.body.user) req.body.user = req.user._id;

  next();
};
