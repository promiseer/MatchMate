const express = require("express");
const router = express.Router();
const controller = require("../controller");
const validationSchema = require("../validation/index");
const middleware = require("../middleware/index");

router.post(
  "/create",
  middleware.fileUpload.single("image"),
  middleware.joiValidation(validationSchema.notification.create),
  middleware.isAuth,
  controller.notification.create
);
router.post(
  "/getAll",
  middleware.joiValidation(validationSchema.notification.getAll),
  middleware.isAuth,
  controller.notification.getAll
);
router.post(
  "/seen",
  middleware.joiValidation(validationSchema.notification.seen),
  middleware.isAuth,
  controller.notification.seen
);
router.get(
  "/:id",
  middleware.joiValidation(validationSchema.notification.getSingle),
  middleware.isAuth,
  controller.notification.getSingle
);
router.post(
  "/setStatus",
  middleware.joiValidation(validationSchema.notification.setStatus),
  middleware.isAuth,
  controller.notification.setStatus
);
module.exports = router;
