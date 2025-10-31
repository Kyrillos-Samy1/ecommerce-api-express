//! @desc This class is responsible for operational errors in the application (Errors that I can predict).
class APIError extends Error {
  constructor(message, statusCode, name) {
    super(message); //! Call the parent class constructor (Error) to initialize the error object.
    this.name = name || "APIError";
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; //! Operational errors are expected and handled

    Error.captureStackTrace(this, this.constructor); //! Capture the stack trace for debugging purposes
  }
}

module.exports = APIError;
