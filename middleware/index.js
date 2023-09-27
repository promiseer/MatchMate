const isAuth = require("./isAuth");
const fileUpload = require("./fileUpload");
const joiValidation = require("./joi.middleware");
const isAdmin = require("./isAdmin");
module.exports = {
  isAuth,
  fileUpload,
  joiValidation,
  isAdmin,
};
