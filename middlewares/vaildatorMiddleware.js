const { validationResult } = require("express-validator");

//! 2- Middleware => catch errors from rules if it exists.
const validatorMiddleware = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }
  //! If no errors, proceed to the next middleware or route handler
  next();
};

module.exports = validatorMiddleware;
