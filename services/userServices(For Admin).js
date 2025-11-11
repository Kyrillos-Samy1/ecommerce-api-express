const { default: slugify } = require("slugify");
const bcrypt = require("bcryptjs");

const UserModel = require("../models/userModel");
const APIError = require("../utils/apiError");

const {
  deleteOneDocument,
  getDocumentById,
  getAllDocuments,
  createDocumnet
} = require("./handlersFactory");
const {
  sanitizeUserForSignUp,
  sanitizeUserForLogin,
  sanitizeUserForUpdate,
  sanitizeUserForGet
} = require("../utils/sanitizeData");

//*=======================================  (CREATE, GET, PUT, DELETE) User Data For Admin  ==========================================

//! @desc Create User
//! @route POST /api/v1/user
//! @access Private/Admin
exports.createUser = createDocumnet(UserModel, "User", sanitizeUserForSignUp);

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
exports.deleteUser = deleteOneDocument(UserModel, "User", "userId");
