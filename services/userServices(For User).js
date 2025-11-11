const { default: slugify } = require("slugify");
const bcrypt = require("bcryptjs");

const UserModel = require("../models/userModel");
const APIError = require("../utils/apiError");

const { createToken } = require("./authServices");
const {
  deleteFromCloudinary
} = require("../middlewares/uplaodToCloudinaryMiddleware");
const { sanitizeUserForUpdate } = require("../utils/sanitizeData");

//*===========================================  (GET, PUT, DELETE) User Data For User  ==============================================

//! @desc Delete Image From Cloudinary Before Delete User
exports.deleteImageFromCloudinaryBeforeDeleteUser = async (req, res, next) => {
  try {
    if (req.user.userPhoto) {
      await deleteFromCloudinary(req.user.userPhoto.imagePublicId);
    }

    if (req.params.userId) {
      const user = await UserModel.findById(req.params.userId);
      if (user.userPhoto) {
        await deleteFromCloudinary(user.userPhoto.imagePublicId);
      }
    }
    next();
  } catch (err) {
    next(new APIError(err.message, 500, err.name));
  }
};

//! @desc Get Current User Data
//! @route GET /api/v1/users/getMe
//! @access Private/Protected
exports.getMe = (req, res, next) => {
  req.params.userId = req.user._id;
  next();
};

//! @desc Update Current User Data
//! @route PATCH /api/v1/users/updateMe
//! @access Private/Protected
exports.updateLoggedUserData = async (req, res, next) => {
  try {
    const updateData = {
      email: req.body.email,
      phone: req.body.phone,
      userPhoto: req.body.userPhoto
    };

    if (req.body.name) {
      updateData.name = req.body.name;
      updateData.slug = slugify(req.body.name);
    }
    const updatedDocument = await UserModel.findOneAndUpdate(
      { _id: req.user._id },
      updateData,
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

//! @desc Change Current User Password
//! @route PATCH /api/v1/users/changePassword
//! @access Private/Protected
exports.updateLoggedUserPassword = async (req, res, next) => {
  try {
    const updatedDocument = await UserModel.findOneAndUpdate(
      { _id: req.user._id },
      {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangedAt: Date.now() - 1000
      },
      { new: true, runValidators: true }
    )
      .select("-__v")
      .populate({ path: "reviews", select: "-__v" });

    const token = createToken(updatedDocument._id);

    res.status(200).json({
      data: sanitizeUserForUpdate(updatedDocument),
      token,
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

//! @desc Logout User
//! @route GET /api/v1/users/logout
//! @access Public
exports.logoutUser = (req, res, next) => {
  res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "none" });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });

  res
    .status(200)
    .json({ status: "success", message: "Logged Out Successfully" });
};
