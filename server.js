const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

dotenv.config({ path: "./config.env" });
const compression = require("compression");
const helmet = require("helmet");
const { limiter, xssProtection } = require("./middlewares/securityMiddleware");
const APIError = require("./utils/apiError");
const globalErrorHandler = require("./middlewares/errorMiddleware");
const { Routes } = require("./routes");
const { webhookCheckout } = require("./services/stripePaymentServices");
const dbConnection = require("./config/databaseConnection");

//! Connect with DB
dbConnection();

//! Initialize Express App
const app = express();

//! Stripe Webhook to handle post-payment actions
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

//! Logging middleware for development environment
app.use(express.json({ limit: "300kb" })); //! Middleware to parse JSON request bodies up to 300kb in size
app.use(cookieParser()); //! Middleware to parse Cookies
app.use(cors()); //! Middleware to enable any domain to access your APIs
app.options("*", cors()); //! Enable pre-flight across-the-board requests
app.use(compression()); //! Middleware to enable GZIP compression for responses

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Node Environment: ${process.env.NODE_ENV}`);
}

//? Security Middleware
//! Set security HTTP headers
app.use(helmet());

//! Prevent XSS attacks and clickjacking vulnerabilities by setting the X-XSS-Protection header
app.use(xssProtection());

//! Rate limiting middleware
app.use("/api", limiter);

//! Mount Routes to handle requests
Routes(app);

app.get("/", (req, res) => {
  res.send("Welcome to the API Server!");
});

//! Handle all other routes
app.all("*", (req, res, next) => {
  next(
    new APIError(`Can't find this route: ${req.originalUrl}`, 400, "NotFound")
  );
});

//! Global error handling middleware
app.use(globalErrorHandler);

//! Start the server
const PORT = process.env.PORT || 8000;
const SERVER = app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

//! Handle rejection errors outside express
process.on("unhandledRejection", (err) => {
  console.error(
    `Unhandled Rejection Errors => 
      Name: ${err.name} | 
      Message: ${err.message} | 
      Stack: ${err.stack}`
  );
  //! Close the server first and exit the process
  if (SERVER) {
    SERVER.close(() => {
      console.error("Shutting down the server Before Exit...");
      process.exit(1);
    });
  }
});
