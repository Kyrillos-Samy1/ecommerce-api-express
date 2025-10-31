const { default: mongoose } = require("mongoose");
const UserModel = require("../models/userModel");

//! @desc Add Product To Wishlist
//! @route POST /api/v1/users/wishlist
//! @access Protected/User
exports.addProductToWishlist = async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: req.body.productId } },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    results: user.wishlist.length,
    userWishlist: user.wishlist,
    message: "Product Added To Wishlist Successsfully!"
  });
};

//! @desc Get User Wishlist
//! @route GET /api/v1/users/wishlist
//! @access Protected/User
exports.getUserWishlist = async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).populate({
    path: "wishlist",
    select: "-__v"
  });

  res.status(200).json({
    results: user.wishlist.length,
    userWishlist: user.wishlist,
    message: "Wishlist Fetched Successfully!"
  });
};

//! @desc Delete Product From Wishlist
//! @route DELETE /api/v1/users/wishlist/:productId
//! @access Protected/User
exports.deleteProductFromWishlist = async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: new mongoose.Types.ObjectId(req.params.productId) } },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    results: user.wishlist.length,
    userWishlist: user.wishlist,
    message: "Product deleted from wishlist!"
  });
};

//! @desc Clear Wishlist
//! @route DELETE /api/v1/users/wishlist/clear
//! @access Protected/User
exports.clearWishlist = async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { $set: { wishlist: [] } },
    { new: true, runValidators: true }
  );

  res
    .status(200)
    .json({ userWishlist: user.wishlist, message: "Wishlist cleared!" });
};
