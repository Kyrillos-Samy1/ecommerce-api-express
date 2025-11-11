const express = require("express");
const { default: helmet } = require("helmet");
const hpp = require("hpp");
const ExpressMongoSanitize = require("express-mongo-sanitize");
const { limiter, xssProtection } = require("./securityMiddleware");

exports.mountSecurityMiddlewares = (app) => {
  //! Set security HTTP headers
  app.use(helmet());

  //! Prevent XSS attacks and clickjacking vulnerabilities by setting the X-XSS-Protection header
  app.use(xssProtection());

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

  //! Prevent SQL injection attacks
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  //! Prevent NoSQL injection attacks
  app.use(ExpressMongoSanitize());

  return app;
};
