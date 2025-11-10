const { default: rateLimit } = require("express-rate-limit");

//! Rate Limiting middleware
exports.limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!"
});
