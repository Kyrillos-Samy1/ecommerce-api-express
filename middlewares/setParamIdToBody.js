//! If field is not provided in the request body, we set it from the params
exports.setParamIdToBodyAndUserId =
  (paramName, switchedField, userField) => (req, _res, next) => {
    if (!req.body[switchedField] && req.params[paramName]) {
      req.body[switchedField] = req.params[paramName];
    }

    if (!req.body[userField]) {
      req.body[userField] = req.user._id;
    }

    next();
  };
