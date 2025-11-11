exports.sanitizeUserForSignUp = (user) => ({
  _id: user._id,
  name: user.name,
  slug: user.slug,
  email: user.email,
  userPhoto: user.userPhoto,
  phone: user.phone
});

exports.sanitizeUserForLogin = (user) => ({
  _id: user._id,
  name: user.name,
  slug: user.slug,
  email: user.email,
  userPhoto: user.userPhoto,
  phone: user.phone,
  wishlist: user.wishlist,
  addresses: user.addresses
});
