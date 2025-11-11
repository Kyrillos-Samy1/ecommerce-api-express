const { default: helmet } = require("helmet");
const hpp = require("hpp");
const ExpressMongoSanitize = require("express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");

const { limiter, contentSecurityPolicy } = require("./securityMiddleware");

exports.mountSecurityMiddlewares = (app) => {
  //! Prevent NoSQL injection attacks
  app.use(ExpressMongoSanitize());

  //! Prevent XSS attacks by using the xss middleware
  app.use(xss())

  //! Set security HTTP headers
  app.use(helmet());

  //! Prevent XSS attacks and clickjacking vulnerabilities by setting the X-XSS-Protection header
  app.use(contentSecurityPolicy());

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
  app.use("/api", limiter);

  return app;
};
