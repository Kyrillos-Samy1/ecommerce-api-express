const { default: rateLimit } = require("express-rate-limit");
const { default: helmet } = require("helmet");

//! Rate Limiting middleware
exports.limiter = (maxLimitig) =>
  rateLimit({
    //! Generate a unique key for each request based on the user's ID or email
    keyGenerator: (req) => req.user?._id || req.body.email,
    max: maxLimitig,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests, please try again in an hour!"
  });

//! Prevent XSS attacks and clickjacking vulnerabilities by setting the X-XSS-Protection header
exports.customCSPProtection = () =>
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://checkout.stripe.com"]
    }
  });
