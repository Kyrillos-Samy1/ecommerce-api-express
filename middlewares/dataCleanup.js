const APIError = require("../utils/apiError");

//! @desc Find documents with user IDs that do not exist in the Users collection
exports.cleanOrphanDocuments = async (Model, next) => {
  try {
    const orphanDocuments = await Model.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData"
        }
      },
      {
        $match: {
          $or: [
            { userData: { $size: 0 } }, //! Find Documents with no matching user
            { user: null } //! Find Documents with null user field
          ]
        }
      },
      {
        $project: { _id: 1 } //! Only need the document IDs to delete
      }
    ]);

    if (orphanDocuments.length > 0) {
      const ids = orphanDocuments.map((doc) => doc._id);
      await Model.deleteMany({ _id: { $in: ids } });
    }

    next();
  } catch (err) {
    next(new APIError("Error Deleting Orphan Documents!", 500, err.message));
  }
};
