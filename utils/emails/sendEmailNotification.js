const UserModel = require("../../models/userModel");
const APIError = require("../apiError");
const sendEmail = require("./sendEmailService");

exports.sendEmailNotification = async (
  req,
  res,
  next,
  email,
  htmlForVerifyCode,
  subject,
  jsonMessage
) => {
  let user;

  //! Get user based on posted email address in case of forgot password
  if (req.body?.email) {
    user = await UserModel.findOne({ email: req.body.email });
  }

  try {
    await sendEmail(
      {
        email: user?.email || email,
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
      message: jsonMessage
    });
  } catch (err) {
    if (user) {
      await UserModel.findByIdAndUpdate(
        { _id: user._id },
        {
          $unset: {
            resetPasswordCode: "",
            resetPasswordCodeExpires: "",
            isForgotPasswordCodeVerified: false
          }
        },
        { new: true, runValidators: false }
      );
    }

    return next(
      new APIError(
        "There was an error sending the email. Please try again later!",
        500,
        err.name
      )
    );
  }
};
