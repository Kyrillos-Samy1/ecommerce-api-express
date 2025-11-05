const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

dotenv.config({ path: "./config.env" });
const compression = require("compression");
const dbConnection = require("./config/databaseConnection");
const APIError = require("./utils/apiError");
const globalErrorHandler = require("./middlewares/errorMiddleware");
const { Routes } = require("./routes");
const { webhookCheckout } = require("./services/orderServices");

//! Connect with DB
dbConnection();

//! Initialize Express App
const app = express();

//! Logging middleware for development environment
app.use(express.json()); //! Middleware to parse JSON bodies
app.use(cookieParser()); //! Middleware to parse Cookies
app.use(cors()); //! Middleware to enable any domain to access your APIs
app.options("*", cors()); //! Enable pre-flight across-the-board requests
app.use(compression()); //! Middleware to enable GZIP compression for responses
app.use(express.static(path.join(__dirname, "uploads"))); //! Middleware to serve static files in "uploads" folder

app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Node Environment: ${process.env.NODE_ENV}`);
}

//! Mount Routes to handle requests
Routes(app);

app.get("/", (req, res) => {
  res.send("Hello, World!");
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
