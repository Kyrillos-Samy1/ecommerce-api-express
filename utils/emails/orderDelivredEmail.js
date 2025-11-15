const APIError = require("../apiError");
const sendEmail = require("./sendEmail");

const sendNotificationEmail = async (email, htmlContent, subject) => {
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
  } catch (error) {
    throw APIError(
      "Failed to send delivery email.",
      500,
      "Order Delivery Email Error"
    );
  }
};

module.exports = sendNotificationEmail;
