const express = require("express");
const router = express.Router();
const controller = require("../controller");
const validationSchema = require("../validation/index");
const middleware = require("../middleware/index");

router.post(
  "/create",
  middleware.joiValidation(validationSchema.role.create),
  middleware.isAuth,
  middleware.isAdmin,
  controller.role.create
);
router.post(
  "/getAll",
  middleware.joiValidation(validationSchema.role.getAll),
  middleware.isAuth,
  middleware.isAdmin,
  controller.role.getAll
);
router.post(
  "/edit",
  middleware.isAuth,
  middleware.isAdmin,
  middleware.joiValidation(validationSchema.role.edit),
  controller.role.edit
);
router.delete(
  "/delete/:id",
  middleware.isAuth,
  middleware.isAdmin,
  controller.role.delete
);
module.exports = router;
