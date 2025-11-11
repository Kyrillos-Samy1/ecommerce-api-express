const baseSanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  slug: user.slug,
  email: user.email,
  userPhoto: user.userPhoto,
  phone: user.phone
});

exports.sanitizeUserForSignUp = (user) => baseSanitizeUser(user);

exports.sanitizeUserForLogin = (user) => ({
  ...baseSanitizeUser(user),
  wishlist: user.wishlist,
  addresses: user.addresses
});

exports.sanitizeUserForUpdate = (user) => baseSanitizeUser(user);

exports.sanitizeUserForGet = exports.sanitizeUserForLogin;
