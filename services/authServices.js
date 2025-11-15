const { default: slugify } = require("slugify");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
require("dotenv").config();

const UserModel = require("../models/userModel");
const APIError = require("../utils/apiError");
const userVerificationEmailTemplate = require("../utils/emails/templates/userVerificationEmailTemplate");
const {
  sendEmailNotification
} = require("../utils/emails/sendEmailNotification");
const {
  sanitizeUserForSignUp,
  sanitizeUserForLogin
} = require("../utils/sanitizeData");

const createToken = (payload) =>
  jwt.sign({ id: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

const createRefreshToken = (payload) =>
  jwt.sign({ id: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES
  });

exports.createRefreshToken = createRefreshToken;

exports.createToken = createToken;

const getTokenFromHeader = (req) => {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  return token;
};

const isCurrentUserExists = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const currentUser = await UserModel.findById(decoded.id).select(
    "+password +active"
  );
  return { decoded, currentUser };
};

const isPasswordChangedAfterTokenIssued = (currentUser, JWTTimestamp) => {
  if (!currentUser.passwordChangedAt) return false;
  const passwordChangedAt = parseInt(
    currentUser.passwordChangedAt.getTime() / 1000,
    10
  );
  return JWTTimestamp < passwordChangedAt;
};

const generateRandomCodeAndHashIt = () => {
  //! Generate the random 6-digit reset token
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  const expiresResetCode = Date.now() + 10 * 60 * 1000; //! 10 minutes

  return {
    resetCode,
    hashedResetCode,
    expiresResetCode
  };
};

exports.setCookiesInBrowser = (req, res, user) => {
  //! Generete New Token
  const token = createToken(user._id);
  const refreshToken = createRefreshToken(user._id);

  //! Set Cookie (JWT) in Browser
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 60 * 1000 //! 15 minutes
  });

  //! Set Cookie (Refresh Token) in Browser
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  return { token, refreshToken };
};

const setCookiesInBrowser = exports.setCookiesInBrowser;

exports.sendResetCodeToUser = async (
  user,
  req,
  res,
  next,
  h2Content,
  pContent,
  aContent,
  title
) => {
  //! Generate the random 6-digit reset token & Hash it & Save it into DB
  const { resetCode, hashedResetCode, expiresResetCode } =
    generateRandomCodeAndHashIt();

  //! Send it to user's email
  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/auth/resetCode`;

  //! HTML Code For Verify Code For Forgot Password
  const htmlForVerifyCode = userVerificationEmailTemplate(
    user,
    resetCode,
    resetURL,
    h2Content,
    pContent,
    aContent,
    title
  );

  await sendEmailNotification(
    req,
    res,
    next,
    user.email,
    htmlForVerifyCode,
    `${title} (valid for 10 min)`,
    "Reset Code Sent Successfully! Check Your Email!"
  );

  return { resetCode, hashedResetCode, expiresResetCode };
};

const sendResetCodeToUser = exports.sendResetCodeToUser;

//! @desc Sign-up
//! @route POST /api/vi/auth/signup
//! @access Public
exports.signup = async (req, res, next) => {
  try {
    //! Create a new user
    const user = await UserModel.create({
      name: req.body.name,
      slug: slugify(req.body.name),
      email: req.body.email,
      password: req.body.password,
      userPhoto: req.body.userPhoto
    });

    const { token } = setCookiesInBrowser(req, res, user);

    const { hashedResetCode, expiresResetCode } = await sendResetCodeToUser(
      user,
      req,
      res,
      next,
      "Email Verification Required",
      "Welcome! Please enter the following code to verify your email address and activate your account.",
      "Verify Email",
      "Email Verification Code"
    );

    //! Save the data into DB
    await UserModel.findByIdAndUpdate(
      { _id: user._id },
      {
        $set: {
          active: false,
          emailVerificationCode: hashedResetCode,
          emailVerificationCodeExpires: expiresResetCode,
          isEmailVerified: false
        }
      },
      { new: true, runValidators: false }
    );

    res.status(201).json({
      data: sanitizeUserForSignUp(user),
      token,
      message: "Reset Code Sent Successfully! Please check your email."
    });
  } catch (error) {
    next(new APIError(error.message, 500));
  }
};

//! @desc Reset Email Code
//! @route POST /api/vi/auth/resetEmailCode
//! @access Public
exports.resetEmailCode = async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });

  try {
    await sendResetCodeToUser(
      user,
      req,
      res,
      next,
      "Email Verification Required",
      "Welcome! Please enter the following code to verify your email address and activate your account.",
      "Verify Email",
      "Email Verification Code"
    );

    res.status(200).json({ message: "Reset Code Sent Successfully!" });
  } catch (error) {
    next(new APIError(error.message, 500, error.name));
  }
};

//! @desc Verify Reset Code For Sign-up
//! @route POST /api/vi/auth/verifyResetCodeForSignUp
//! @access Public
exports.verifyResetCodeForSignUp = async (req, res, next) => {
  //! Get User Based On Reset Code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCodeForSignUp)
    .digest("hex");

  const user = await UserModel.findOne({
    emailVerificationCode: hashedResetCode,
    isEmailVerified: false
  });

  if (!user) throw new Error("Reset Code is Invalid or Already Verified!");

  try {
    await UserModel.findByIdAndUpdate(
      { _id: user._id },
      {
        $set: {
          isEmailVerified: true,
          emailVerificationCode: "",
          emailVerificationCodeExpires: "",
          active: true
        }
      },
      { new: true, runValidators: false }
    );

    res.status(200).json({ message: "Reset Code Verified Successfully!" });
  } catch (error) {
    next(new APIError(error.message, 500, error.name));
  }
};

//! @desc Login
//! @route POST /api/vi/auth/login
//! @access Public
exports.login = async (req, res, next) => {
  try {
    //! Find the user by email
    const user = await UserModel.findOne({ email: req.body.email })
      .select("-__v")
      .populate([
        { path: "reviews", select: "-__v" },
        { path: "wishlist", select: "-__v" }
      ]);

    const { token } = setCookiesInBrowser(req, res, user);

    res.status(200).json({
      data: sanitizeUserForLogin(user),
      token,
      message: "Login successful!"
    });
  } catch (error) {
    next(new APIError(error.message, 500, error.name));
  }
};

//! @desc Protect Routes
//! @route N/A
//! @access Private
exports.protectRoutes = async (req, res, next) => {
  try {
    //! Check if the token is provided
    const token = getTokenFromHeader(req);

    if (!token) {
      return next(
        new APIError(
          "You are not logged in! Please login to get access.",
          401,
          "Unauthorized"
        )
      );
    }

    //! Verify the token and get the user info from the token
    const { decoded, currentUser } = await isCurrentUserExists(token);

    if (!currentUser) {
      return next(
        new APIError(
          "The user belonging to this token does no longer exist.",
          401,
          "Unauthorized"
        )
      );
    }

    //! Check if user is suspended or not
    if (currentUser.active === false) {
      return next(
        new APIError(
          "Your account has been suspended! Please contact support.",
          401,
          "Unauthorized"
        )
      );
    }

    //! Check if user changed password after the token was issued
    if (isPasswordChangedAfterTokenIssued(currentUser, decoded.iat)) {
      return next(
        new APIError(
          "User recently changed password! Please login again.",
          401,
          "Unauthorized"
        )
      );
    }

    //! Check if user is verified or not
    if (!currentUser.isEmailVerified) {
      return next(
        new APIError(
          "User is not verified! Please verify your email first.",
          401,
          "Unauthorized"
        )
      );
    }

    //! Grant access to protected route
    req.user = currentUser;

    next();
  } catch (error) {
    next(new APIError(error.message, 500, error.name));
  }
};

//! @desc Allow access to specific roles (Authorization)
//! @route N/A
//! @access Private
exports.allowRoles =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : next(
          new APIError(
            `You do not have permission to perform this action! Only ${roles.join(", ")} ${roles.length > 1 ? "are" : "is"} allowed to perform this action.`,
            403,
            "Forbidden"
          )
        );

//! @desc  Refresh Token
//! @route POST /api/v1/auth/refreshToken
//! @access Public
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return next(new APIError("No refresh token!", 401, "Unauthorized"));

    //! Verify refresh token ONLY
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);

    const user = await UserModel.findById(decoded.id);
    if (!user)
      return next(new APIError("User no longer exists!", 401, "Unauthorized"));

    //! Create new tokens
    const newAccessToken = createToken(user._id);
    const newRefreshToken = createRefreshToken(user._id);

    //! Send new tokens to cookies
    res.cookie("jwt", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      status: "success",
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(new APIError(error.message, 401, error.name));
  }
};

//*==================================================== FORGOT PASSWORD ==============================================

//! @desc Forgot Password
//! @route POST /api/v1/auth/forgotPassword
//! @access Public
exports.forgotPassword = async (req, res, next) => {
  try {
    //! Get user based on posted email address
    const user = await UserModel.findOne({ email: req.body.email });

    const { hashedResetCode, expiresResetCode } = await sendResetCodeToUser(
      user,
      req,
      res,
      next,
      "Password Reset Request",
      "We received a request to reset your password. Please enter the following code to proceed.",
      "Verify Reset Code",
      "Password Reset Code"
    );

    await UserModel.findByIdAndUpdate(
      { _id: user._id },
      {
        $set: {
          resetPasswordCode: hashedResetCode,
          resetPasswordCodeExpires: expiresResetCode,
          isForgotPasswordCodeVerified: false
        }
      },
      { new: true, runValidators: false }
    );
  } catch (error) {
    next(new APIError(error.message, 500, error.name));
  }
};

//! @desc Verify Reset Code For Forgot Password
//! @route POST /api/v1/auth/verifyResetCodeForPassword
//! @access Public
exports.verifyResetCodeForForgotPassword = async (req, res, next) => {
  //! Get User Based On Reset Code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCodeForForgotPassword)
    .digest("hex");

  const user = await UserModel.findOne({
    resetPasswordCode: hashedResetCode,
    isForgotPasswordCodeVerified: false
  });

  if (!user) {
    throw new Error("Reset Code is Invalid or Already Verified!");
  }

  //! Make Reset Verified is (true) or isEmailVerified is (true)
  await UserModel.findByIdAndUpdate(
    { _id: user._id },
    { $set: { isForgotPasswordCodeVerified: true } },
    {
      new: true,
      runValidators: false
    }
  );

  res.status(200).json({ status: "success", message: "Reset Code Verified!" });
};

//! @desc Reset Password
//! @route POST /api/v1/auth/resetPassword
//! @access Public
exports.resetPassword = async (req, res, next) => {
  try {
    //! Get User Based On Email
    const user = await UserModel.findOne({ email: req.body.email });

    //! Update User Password
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    await UserModel.findByIdAndUpdate(
      { _id: user._id },
      { password: hashedPassword, passwordChangedAt: Date.now() - 1000 },
      { new: true, runValidators: false }
    );

    //! Make Reset Verified is (false)
    await UserModel.findByIdAndUpdate(
      { _id: user._id },
      {
        $set: {
          resetPasswordCode: "",
          resetPasswordCodeExpires: "",
          isForgotPasswordCodeVerified: false
        }
      },
      { new: true, runValidators: false }
    );

    res.status(200).json({
      status: "success",
      message: "Password Updated Successfully! Please login again."
    });
  } catch (error) {
    next(new APIError(error.message, 500, error.name));
  }
};
