const express = require("express");
const router = express.Router();
const controller = require("../controller");
const validationSchema = require("../validation/index");
const middleware = require("../middleware/index");
router.post(
  "/createUser",
  middleware.fileUpload.single("profileImage"),
  middleware.joiValidation(validationSchema.user.register),
  // middleware.isAuth,
  // middleware.isAdmin,
  controller.user.register
);
router.post(
  "/signin",
  middleware.joiValidation(validationSchema.user.signin),
  controller.user.signIn
);
router.get("/getUser", middleware.isAuth, controller.user.getUser);
router.post(
  "/getAll",
  middleware.isAuth,
  middleware.isAdmin,
  controller.user.getAll
);
router.post(
  "/edit",
  middleware.fileUpload.single("profileImage"),
  middleware.joiValidation(validationSchema.user.edit),
  middleware.isAuth,
  middleware.isAdmin,
  controller.user.edit
);
router.post(
  "/updateFirebaseToken",
  middleware.joiValidation(validationSchema.user.updateFirebaseToken),
  // middleware.isAuth,
  controller.user.updateFirebaseToken
);

router.delete("/delete/:id", middleware.isAuth, controller.user.delete);

module.exports = router;
