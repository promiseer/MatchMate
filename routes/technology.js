const express = require("express");
const router = express.Router();
const controller = require("../controller");
const validationSchema = require("../validation/index");
const middleware = require("../middleware/index");

router.post(
  "/create",
  middleware.fileUpload.single("image"),
  middleware.joiValidation(validationSchema.technology.create),
  middleware.isAuth,
  middleware.isAdmin,
  controller.technology.create
);
router.post(
  "/getAll",
  middleware.joiValidation(validationSchema.technology.getAll),
  controller.technology.getAll
);
router.get(
  "/:id",
  middleware.joiValidation(validationSchema.technology.getSingle),
  controller.technology.getSingle
);
router.post(
  "/edit",
  middleware.isAuth,
  middleware.isAdmin,
  middleware.fileUpload.single("image"),
  middleware.joiValidation(validationSchema.technology.edit),
  controller.technology.edit
);
router.delete(
  "/delete/:id",
  middleware.isAuth,
  middleware.isAdmin,
  controller.technology.delete
);
module.exports = router;
