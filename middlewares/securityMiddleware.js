const { default: rateLimit } = require("express-rate-limit");
const { default: helmet } = require("helmet");

//! Rate Limiting middleware
exports.limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!"
});

//! Prevent XSS attacks and clickjacking vulnerabilities by setting the X-XSS-Protection header
exports.xssProtection = () =>
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
