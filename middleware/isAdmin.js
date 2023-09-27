const isAdmin = (req, res, next) => {
  console.log(req.currentUser)
  if (req.currentUser.role === "admin") {
    next();
  } else {
    res
      .status(STATUS_NOT_ALLOWED)
      .send(errorResponse(STATUS_NOT_ALLOWED, "Only admin can access"));
  }
};
module.exports = isAdmin;
