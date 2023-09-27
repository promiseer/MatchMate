const express = require("express");
const router = express.Router();
const controller = require("../controller");
const validationSchema = require("../validation/index");
const middleware = require("../middleware/index");

router.post(
  "/getAll",
  middleware.joiValidation(validationSchema.activityLog.getAll),
  middleware.isAuth,
  controller.activityLog.getAll
);
module.exports = router;
