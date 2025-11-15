const { default: helmet } = require("helmet");
const hpp = require("hpp");
const ExpressMongoSanitize = require("express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");

const { limiter, customCSPProtection } = require("./securityMiddleware");

exports.mountSecurityMiddlewares = (app) => {
  //! Prevent NoSQL injection attacks like
  app.use(ExpressMongoSanitize());

  //! Prevent XSS attacks like script injection by using the xss middleware
  app.use(xss());

  //! Set security HTTP headers like Content-Security-Policy
  app.use(helmet());

  //! Prevent XSS attacks and clickjacking vulnerabilities like X-XSS-Protection
  app.use(customCSPProtection());

  //! Prevent HTTP parameter pollution by using the hpp middleware
  app.use(
    hpp({
      whitelist: [
        "ratingAverage",
        "raringQuantity",
        "quantity",
        "color",
        "size",
        "priceAfterDiscount",
        "price",
        "sold"
      ]
    })
  );

  //! Rate limiting middleware
  app.use("/api", limiter(100));
  app.use("/api/v1/auth/forgotPassword", limiter(5));
  app.use("/api/v1/auth/resetEmailCode", limiter(5));
  app.use("/api/v1/auth/login", limiter(5));


  return app;
};
