const APIError = require("../apiError");
const sendEmail = require("./sendEmail");

exports.sendOrderConfirmationEmail = async (email, htmlContent, subject) => {
  try {
    await sendEmail(
      {
        email,
        subject,
        from:
          process.env.NODE_ENV === "production"
            ? process.env.EMAIL_FROM_PROD
            : process.env.EMAIL_FROM_DEV
      },
      htmlContent
    );
  } catch (err) {
    throw new APIError("Failed to send confirmation email.", 500, err.name);
  }
};
