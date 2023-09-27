const express = require("express");
const router = express.Router();
const controller = require("../controller");
const validationSchema = require("../validation/index");
const middleware = require("../middleware/index");

router.post(
  "/create",
  middleware.fileUpload.single("image"),
  middleware.joiValidation(validationSchema.blog.create),
  middleware.isAuth,
  controller.blog.create
);
router.post(
  "/getAll",
  middleware.joiValidation(validationSchema.blog.getAll),
  controller.blog.getAll
);
router.get(
  "/:id",
  middleware.joiValidation(validationSchema.blog.getSingle),
  controller.blog.getSingle
);
router.post(
  "/edit",
  middleware.isAuth,
  middleware.fileUpload.single("image"),
  middleware.joiValidation(validationSchema.blog.edit),
  controller.blog.edit
);
router.delete("/delete/:id", middleware.isAuth, controller.blog.delete);
module.exports = router;
