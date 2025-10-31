const multer = require("multer");
const APIError = require("../utils/apiError");

//? Multer Options
const multerOptions = () => {
  //! Disk Storage Configuration
  // const multerStorage = multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     cb(null, "uploads/categories");
  //   },
  //   filename: (req, file, cb) => {
  //     const extention = file.mimetype.split("/")[1];
  //     const filename = `category-${Date.now()}.${extention}`;
  //     cb(null, filename);
  //   }
  // });

  //! Memory Storage Configuration
  const multerStorage = multer.memoryStorage();

  //! File Filter Configuration
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(
        new APIError(
          "Not an image! Please upload only images.",
          400,
          "File Error"
        ),
        false
      );
    }
  };

  //! Initialize Multer
  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

//? Upload Single Image
exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

//? Upload Multiple Images With Different Names and Different Max Count
exports.uploadMultipleImages = (fieldsArray) =>
  multerOptions().fields(fieldsArray);
