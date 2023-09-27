const userController = require("./user");
const blogController = require("./blog");
const roleController = require("./role");
const technologyController = require("./technology");
const activityLogController = require("./activityLog");
const notificationController = require("./notification");
const commentController = require("./comment");
const locationController = require("./location");
module.exports = {
  user: userController,
  blog: blogController,
  role: roleController,
  technology: technologyController,
  activityLog: activityLogController,
  notification: notificationController,
  comment: commentController,
  location:locationController
};
