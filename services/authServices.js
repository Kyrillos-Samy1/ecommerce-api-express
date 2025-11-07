const { default: slugify } = require("slugify");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
require("dotenv").config();

const UserModel = require("../models/userModel");
const APIError = require("../utils/apiError");
const verifyCodeTemplate = require("../utils/emails/templates/htmlTemplateForForgotPassword");
const { emailAuthTemplate } = require("../utils/emails/authEmail");

const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

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
  const currentUser = await UserModel.findById(decoded.userId).select(
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

const setCookiesInBrowser = (req, res, user) => {
  //! Generete New Token
  const token = createToken(user._id);

  //! Set Cookie (JWT) in Browser
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  //! Set Cookie (Refresh Token) in Browser
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 90 * 24 * 60 * 60 * 1000
  });

  return token;
};

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

    const token = setCookiesInBrowser(req, res, user);

    res
      .status(201)
      .json({ data: user, token, message: "Account created successfully!" });
  } catch (error) {
    next(new APIError(error.message, 500));
  }
};

//! @desc Login
//! @route POST /api/vi/auth/login
//! @access Public
exports.login = async (req, res, next) => {
  try {
    //! Find the user by email
    const user = await UserModel.findOne({ email: req.body.email })
      .select("+password -__v")
      .populate([
        { path: "reviews", select: "-__v" },
        { path: "wishlist", select: "-__v" }
      ]);

    const token = setCookiesInBrowser(req, res, user);

    res.status(200).json({ data: user, token, message: "Login successful!" });
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
            "You do not have permission to perform this action!",
            403,
            "Forbidden"
          )
        );

//*==================================================== FORGOT PASSWORD ==============================================

//! @desc Forgot Password
//! @route POST /api/v1/auth/forgotPassword
//! @access Public
exports.forgotPassword = async (req, res, next) => {
  try {
    //! Get user based on posted email address
    const user = await UserModel.findOne({ email: req.body.email });

    //! Generate the random 6-digit reset token & Hash it & Save it into DB
    const { resetCode, expiresResetCode, hashedResetCode } =
      generateRandomCodeAndHashIt();

    //! Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/resetPassword`;

    //! HTML Code For Verify Code For Forgot Password
    const htmlForVerifyCode = verifyCodeTemplate(
      user,
      resetCode,
      resetURL,
      "Password Reset Request",
      "Please enter the following code to reset your password.",
      "Verify Reset Code",
      "Password Reset Code"
    );

    await emailAuthTemplate(
      req,
      res,
      next,
      htmlForVerifyCode,
      "Passward Reset Code (valid for 10 min)"
    );

    //! Save the data into DB
    await UserModel.findByIdAndUpdate(
      { _id: user._id },
      {
        resetCode: hashedResetCode,
        resetCodeExpires: expiresResetCode,
        resetCodeVerified: false
      },
      { new: true, runValidators: false }
    );
  } catch (error) {
    next(new APIError(error.message, 500, error.name));
  }
};

//! @desc Verify Reset Code
//! @route POST /api/v1/auth/resetCode
//! @access Public
exports.verifyResetCode = async (req, res, next) => {
  //! Get User Based On Reset Code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await UserModel.findOne({
    resetCode: hashedResetCode
  });

  //! Make Reset Verified is (true)
  await UserModel.findByIdAndUpdate(
    { _id: user._id },
    { resetCodeVerified: true },
    { new: true, runValidators: false }
  );

  res.status(200).json({ status: "success", message: "Reset Code Verified" });
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
          resetCodeVerified: false,
          resetCode: "",
          resetCodeExpires: ""
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
