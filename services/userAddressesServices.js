const { default: mongoose } = require("mongoose");
const UserModel = require("../models/userModel");

//! @desc Add User Id To Body Middleware
exports.addUserIdToBody = (req, res, next) => {
  req.body.userId = req.user._id;
  next();
};

//! @desc Add Address To User
//! @route POST /api/v1/userAddress
//! @access Protected/User
exports.addAddressToUserAddresses = async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: {
        addresses: {
          addressType: req.body.addressType,
          details: req.body.details,
          city: req.body.city,
          state: req.body.state,
          zipCode: req.body.zipCode,
          phone: req.body.phone,
        }
      }
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    results: user.addresses.length,
    userAddresses: user.addresses,
    message: "Address Added Successfully!"
  });
};

//! @desc Get User Addresses
//! @route GET /api/v1/userAddress
//! @access Protected/User
exports.getUserAddresses = async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).populate({
    path: "addresses",
    select: "-__v"
  });

  res.status(200).json({
    results: user.addresses.length,
    userAddresses: user.addresses,
    message: "Addresses Fetched Successfully!"
  });
};

//! @desc Delete Address From User Addresses
//! @route DELETE /api/v1/userAddress/:addressId
//! @access Protected/User
exports.deleteAddressFromUserAddresses = async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { addresses: new mongoose.Types.ObjectId(req.params.addressId) } },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    results: user.addresses.length,
    userAddresses: user.addresses,
    message: "Address Deleted From User Addresses!"
  });
};

//! @desc Clear User Addresses
//! @route DELETE /api/v1/userAddress/clear
//! @access Protected/User
exports.clearUserAddresses = async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $set: { addresses: [] } },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    userAddresses: user.addresses,
    message: "User Addresses Cleared!"
  });
};
