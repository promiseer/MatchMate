const isAdmin = (req, res, next) => {
  if (req.currentUser.role === "Admin") {
    next();
  } else {
    res
      .status(STATUS_NOT_ALLOWED)
      .send(errorResponse(STATUS_NOT_ALLOWED, "Only admin can access"));
  }
};
module.exports = isAdmin;
