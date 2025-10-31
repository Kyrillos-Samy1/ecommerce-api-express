const { default: slugify } = require("slugify");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");

const UserModel = require("../models/userModel");
const APIError = require("../utils/apiError");

const {
  deleteOneDocument,
  getDocumentById,
  getAllDocuments,
  createDocumnet
} = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

//*=======================================  (CREATE, GET, PUT, DELETE) User Data For Admin  ==========================================

//! @desc Create User
//! @route POST /api/v1/user
//! @access Private/Admin
exports.createUser = createDocumnet(UserModel, "User");

exports.uploadUserImage = uploadSingleImage("userPhoto");

//! Image Processing Using Sharp
exports.resizeUserImage = async (req, res, next) => {
  if (!req.file) return next();

  req.body.userPhoto = `user_photo-${Date.now()}.webp`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("webp")
    .webp({ quality: 90 })
    .toFile(`uploads/users/${req.body.userPhoto}`);

  next();
};

//! @desc Get All user With Pagination
//! @route GET /api/v1/users
//! @access Private/Admin
exports.getAllUsers = getAllDocuments(
  UserModel,
  "User",
  [{ path: "reviews", select: "-__v" }],
  ["name", "email"],
  "userId"
);

//! @desc Get Specific user
//! @route GET /api/v1/users/:userId
//! @access Private/Admin
exports.getUserById = getDocumentById(
  UserModel,
  "User",
  [{ path: "reviews", select: "-__v" }],
  "userId",
  "-__v +password +active"
);

//! @desc Update Specific User
//! @route PUT /api/v1/users/:userId
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
      .select("-__v +password +active")
      .populate({ path: "reviews", select: "-__v" });

    res.status(200).json({
      data: updatedDocument,
      message: `User Updated Successfully!`
    });
  } catch (err) {
    next(new APIError(`Error updating user: ${err.message}`, 500, err.name));
  }
};

//! @desc Change User Password
//! @route PUT /api/v1/users/change-password/:userId
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
      .select("-__v +password +active")
      .populate({ path: "reviews", select: "-__v" });

    res.status(200).json({
      data: updatedDocument,
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
exports.deleteUser = deleteOneDocument(UserModel, "User", "userId");
