const UserModel = require("../../models/userModel");
const APIError = require("../apiError");
const sendEmail = require("./sendEmail");

exports.emailAuthTemplate = async (
  req,
  res,
  next,
  htmlForVerifyCode,
  subject = ""
) => {
  //! Get user based on posted email address
  const user = await UserModel.findOne({ email: req.body.email });

  try {
    await sendEmail(
      {
        email: user.email,
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
      message: "Message sent to email!"
    });
  } catch (err) {
    await UserModel.findByIdAndUpdate(
      { _id: user._id },
      {
        $unset: {
          resetCode: "",
          resetCodeExpires: "",
          resetCodeVerified: ""
        }
      },
      { new: true, runValidators: false }
    );

    return next(
      new APIError(
        "There was an error sending the email. Please try again later!",
        500,
        err.name
      )
    );
  }
};
