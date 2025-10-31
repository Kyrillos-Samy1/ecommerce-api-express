const setImageUrl = (doc, folderName) => {
  if (!doc) return;

  const baseUrl = process.env.BASE_URL;

  //! For only one image
  if (
    doc.image &&
    typeof doc.image === "string" &&
    !doc.image.startsWith("http" || "https")
  ) {
    doc.image = `${baseUrl}/${folderName}/${doc.image}`;
  }

  //! For cover image
  if (
    doc.imageCover &&
    typeof doc.imageCover === "string" &&
    !doc.imageCover.startsWith("http" || "https")
  ) {
    doc.imageCover = `${baseUrl}/${folderName}/${doc.imageCover}`;
  }

  //! For array of images
  if (Array.isArray(doc.images) && doc.images.length > 0) {
    doc.images = doc.images.map((image) =>
      typeof image === "string" && image.startsWith("http" || "https")
        ? image
        : `${baseUrl}/${folderName}/${image}`
    );
  }

  //! For user photo
  if (
    doc.userPhoto &&
    typeof doc.userPhoto === "string" &&
    !doc.userPhoto.startsWith("http" || "https")
  ) {
    doc.userPhoto = `${baseUrl}/users/${doc.userPhoto}`;
  }
};

//! Middleware function to attach to any schema
const applyImageUrlMiddleware = (schemaModel, folderName) => {
  schemaModel.post("init", (doc) => setImageUrl(doc, folderName)); //! For GET BY ID & GET ALL Documents
  schemaModel.post("save", (doc) => setImageUrl(doc, folderName)); //! For CREATE Document & UPDATE (via .save())
};

module.exports = { applyImageUrlMiddleware };
