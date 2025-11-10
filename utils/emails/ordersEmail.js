const APIError = require("../apiError");
const sendEmail = require("./sendEmail");

exports.orderEmailTemplate = async (
  req,
  res,
  next,
  htmlForVerifyCode,
  subject = ""
) => {
  try {
    await sendEmail(
      {
        email: req.user.email,
        subject: subject,
        from:
          process.env.NODE_ENV === "production"
            ? process.env.EMAIL_FROM_PROD
            : process.env.EMAIL_FROM_DEV
      },
      htmlForVerifyCode
    );

    res.status(200).json({
      status: "success",
      message:
        "Order created successfully! Please proceed to pay at delivery time."
    });
  } catch (err) {
    return next(
      new APIError(
        "There was an error sending the email. Please try again later!",
        500,
        err.name
      )
    );
  }
};
