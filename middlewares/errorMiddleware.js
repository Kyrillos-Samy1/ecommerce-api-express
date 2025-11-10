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

const handleInvalidError = (message, statusCode, name) =>
  new APIError(message, statusCode, name);

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.name === "JsonWebTokenError")
    err = handleInvalidError(
      "Invalid token. Please login again!",
      401,
      err.name
    );
  if (err.name === "TokenExpiredError")
    err = handleInvalidError(
      "Your token has expired! Please login again.",
      401,
      err.name
    );
  if (err.code === "LIMIT_FILE_SIZE")
    err = handleInvalidError(
      "File size is too large. Please upload a file less than 1MB.",
      400,
      err.name
    );

  if (process.env.NODE_ENV === "development") {
    sendErrorForDevMode(err, res);
  } else {
    sendErrorForProdMode(err, res);
  }
};

module.exports = globalErrorHandler;
