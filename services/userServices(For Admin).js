const { default: slugify } = require("slugify");
const bcrypt = require("bcryptjs");

const UserModel = require("../models/userModel");
const APIError = require("../utils/apiError");

const {
  deleteOneDocument,
  getDocumentById,
  getAllDocuments
} = require("./handlersFactory");
const {
  sanitizeUserForSignUp,
  sanitizeUserForLogin,
  sanitizeUserForUpdate,
  sanitizeUserForGet,
  sanitizeUserForDelete
} = require("../utils/sanitizeData");
const { sendResetCodeToUser, setCookiesInBrowser } = require("./authServices");

//*=======================================  (CREATE, GET, PUT, DELETE) User Data For Admin  ==========================================

//! @desc Create User
//! @route POST /api/v1/users/admin
//! @access Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const user = await UserModel.create({
      name: req.body.name,
      slug: slugify(req.body.name),
      email: req.body.email,
      password: req.body.password,
      userPhoto: req.body.userPhoto,
      role: req.body.role || "user",
      active: true,
      phone: req.body.phone
    });

    const { token } = setCookiesInBrowser(req, res, user);

    //! Generate & send email verification code
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

    //! Save verification code info in DB
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
      message: "User Created & Verification Code Sent Successfully!",
      data: sanitizeUserForSignUp(user),
      token
    });
  } catch (error) {
    next(new APIError(error.message, 500, error.name));
  }
};

//! @desc Get All user With Pagination
//! @route GET /api/v1/users
//! @access Private/Admin
exports.getAllUsers = getAllDocuments(
  UserModel,
  "User",
  [{ path: "reviews", select: "-__v" }],
  ["name", "email"],
  "userId",
  sanitizeUserForGet
);

//! @desc Get Specific user
//! @route GET /api/v1/users/:userId
//! @access Private/Admin
exports.getUserById = getDocumentById(
  UserModel,
  "User",
  [{ path: "reviews", select: "-__v" }],
  "userId",
  "-__v",
  sanitizeUserForLogin
);

//! @desc Update Specific User
//! @route PATCH /api/v1/users/:userId
//! @access Private/Admin
exports.updateUser = async (req, res, next) => {
  const body = req.body;
  const documentId = req.params.userId;

  if (body.name) body.slug = slugify(body.name);
  if (body.title) body.slug = slugify(body.title);

  try {
    const updatedDocument = await UserModel.findOneAndUpdate(
      { _id: documentId },
      {
        name: body.name,
        slug: body.slug,
        email: body.email,
        phone: body.phone,
        role: body.role,
        active: body.active,
        userPhoto: body.userPhoto
      },
      { new: true, runValidators: true }
    )
      .select("-__v")
      .populate({ path: "reviews", select: "-__v" });

    res.status(200).json({
      data: sanitizeUserForUpdate(updatedDocument),
      message: `User Updated Successfully!`
    });
  } catch (err) {
    next(new APIError(`Error updating user: ${err.message}`, 500, err.name));
  }
};

//! @desc Change User Password
//! @route PATCH /api/v1/users/change-password/:userId
//! @access Private
exports.changeUserPassword = async (req, res, next) => {
  const body = req.body;
  const documentId = req.params.userId;

  if (body.name) body.slug = slugify(body.name);

  try {
    const updatedDocument = await UserModel.findOneAndUpdate(
      { _id: documentId },
      {
        password: await bcrypt.hash(body.password, 12),
        passwordChangedAt: Date.now() - 1000
      },
      { new: true, runValidators: true }
    )
      .select("-__v")
      .populate({ path: "reviews", select: "-__v" });

    res.status(200).json({
      data: sanitizeUserForUpdate(updatedDocument),
      message: `Password Changed Successfully!`
    });
  } catch (err) {
    next(
      new APIError(
        `Error during changing password: ${err.message}`,
        500,
        err.name
      )
    );
  }
};

//! @desc Delete Specific User
//! @route DELETE /api/v1/users/:userId
//! @access Private/Admin
exports.deleteUser = deleteOneDocument(
  UserModel,
  "User",
  "userId",
  sanitizeUserForDelete
);
