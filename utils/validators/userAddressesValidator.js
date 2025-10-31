const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/vaildatorMiddleware");
const UserModel = require("../../models/userModel");

exports.addAddressToUserAddressesValidator = [
  check("addressType")
    .isString()
    .withMessage("Address Type Must Be A String")
    .trim()
    .notEmpty()
    .withMessage("Address Type Is Required!")
    .isIn(["home", "office", "work", "billing", "shipping", "other"])
    .withMessage(
      "Address Type Must Be One Of (home, office, work, billing, shipping, other)"
    ),
  check("details")
    .isString()
    .withMessage("Address Details Must Be A String")
    .trim()
    .notEmpty()
    .withMessage("Address Details Is Required!")
    .isLength({ min: 2, max: 50 })
    .withMessage("Address Details Must Be Between 2 to 50 Characters!")
    .custom(async (value, { req }) => {
      const user = await UserModel.findById(req.user._id);
      if (!user) {
        throw new Error("User Not Found!");
      }

      if (user.addresses.some((address) => address.details === value)) {
        throw new Error("Address Already Exists!");
      }

      return true;
    }),
  check("city")
    .isString()
    .withMessage("City Must Be A String")
    .trim()
    .notEmpty()
    .withMessage("City Is Required!")
    .isLength({ min: 2, max: 32 })
    .withMessage("City Must Be Between 2 to 32 Characters!"),
  check("state")
    .isString()
    .withMessage("State Must Be A String")
    .trim()
    .notEmpty()
    .withMessage("State Is Required!")
    .isLength({ min: 2, max: 32 })
    .withMessage("State Must Be Between 2 to 32 Characters!"),
  check("zipCode")
    .isString()
    .withMessage("Zip Code Must Be A String")
    .trim()
    .notEmpty()
    .withMessage("Zip Code Is Required!")
    .isPostalCode("any")
    .withMessage("Invalid Zip Code!"),
  check("phone")
    .isMobilePhone(["ar-EG"])
    .withMessage("Invalid Egyptian Phone Number!"),

  validatorMiddleware
];

exports.getUserAddressesValidator = [
  check("userId").custom(async (value, { req }) => {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      throw new Error("User Not Found!");
    }

    if (user.addresses.length === 0) {
      throw new Error("User Has No Addresses!");
    }

    return true;
  }),
  validatorMiddleware
];

exports.deleteAddressFromUserAddressesValidator = [
  check("addressId")
    .isMongoId()
    .withMessage("Invalid Address Id Format")
    .notEmpty()
    .withMessage("Address ID is Required!")
    .custom(async (value, { req }) => {
      const user = await UserModel.findById(req.user._id);
      if (!user) {
        throw new Error("User Not Found!");
      }

      if (user.addresses.length === 0) {
        throw new Error("User Has No Addresses!");
      }

      if (!user.addresses.includes(value)) {
        throw new Error("Address Not Found In User Addresses!");
      }

      return true;
    }),
  validatorMiddleware
];

exports.clearUserAddressesValidator = [
  check("addressId").custom(async (value, { req }) => {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      throw new Error("User Not Found!");
    }

    if (!user.addresses.length) {
      throw new Error("User Has No Addresses!");
    }

    return true;
  }),
  validatorMiddleware
];
