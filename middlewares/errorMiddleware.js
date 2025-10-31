const APIError = require("../utils/apiError");

const sendErrorForDevMode = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });

const sendErrorForProdMode = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });

const handleJWTInvalidError = (err) =>
  new APIError("Invalid token. Please login again!", 401, err.name);

const handleJWTExpiredError = (err) =>
  new APIError("Your token has expired! Please login again.", 401, err.name);

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.name === "JsonWebTokenError") err = handleJWTInvalidError(err);
  if (err.name === "TokenExpiredError") err = handleJWTExpiredError(err);

  if (process.env.NODE_ENV === "development") {
    sendErrorForDevMode(err, res);
  } else {
    sendErrorForProdMode(err, res);
  }
};

module.exports = globalErrorHandler;
