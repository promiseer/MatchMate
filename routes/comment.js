const express = require("express");
const router = express.Router();
const controller = require("../controller");
const validationSchema = require("../validation/index");
const middleware = require("../middleware/index");

router.post(
  "/create",
  middleware.joiValidation(validationSchema.comment.create),
  middleware.isAuth,
  controller.comment.create
);
router.post(
  "/getAll",
  middleware.joiValidation(validationSchema.comment.getAll),
  middleware.isAuth,
  controller.comment.getAll
);

module.exports = router;
