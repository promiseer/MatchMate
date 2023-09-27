const userModel = require("../schema/user");
const locationModel = require("../schema/location");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Types = require("mongoose").Types;
const activityLog = require("../helpers/activityLog");

exports.register = async (req, res) => {

  let user = await userModel.findOne({
    email: req.body.email,
    isDeleted: false,
  });
  if (user) {
    res.status(STATUS_ALREADY_EXISTS).send(
      errorResponse(STATUS_ALREADY_EXISTS, {
        message: "email id already exists",
      })
    );
    return;
  }
  let defaultPass = "123456";
  let payload = {
    ...req.body,
  };
  if (req.file && req.file.filename) {
    Object.assign(payload, { profileImage: req.file.filename });
  }
  // if (req.body.password) {
  let hashedPass = await hashPassword(req.body.password || defaultPass);
  Object.assign(payload, { hashedPassword: hashedPass });
  // }
 
  try {
    let userRecord = await userModel.create(payload);
    let tokenData = await generateToken(
      userRecord._id,
      req.body.name,
      "User",
      req.body.email,
      req.body.profileImage
    );
    if (userRecord)
      res.status(STATUS_OK).send(
        successResponse(STATUS_OK, userRecord,tokenData, {
          message: "registered successfull",
        })
      );
      
    req.userId = req?.currentUser?._id || userRecord._id;
    await activityLog.create(req, userRecord, "inserted");
   
  } catch (error) {
    console.log(error);
    logger.error(errorBody(req.method, req.originalUrl, error.message));
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: error.message,
      })
    );
  }
};
exports.getUser = async (req, res) => {
  try {
    let userRecord = await userModel
      .findOne({
        _id: req.currentUser._id,
        isDeleted: false,
      })
      .populate([
        {
          path: "role",
          model: "role",
          select: "name",
        },
      ]);
    if (userRecord)
      res.status(STATUS_OK).send(
        successResponse(STATUS_OK, userRecord, {
          message: "data fetched",
        })
      );
  } catch (error) {
    console.log(error);
    logger.error(errorBody(req.method, req.originalUrl, error.message));
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: error.message,
      })
    );
  }
};

exports.signIn = async (req, res) => {
  let hashedPass;
  let user = await userModel
    .findOne({
      email: req.body.email,
      isDeleted: false,
    })
    .populate([
      {
        path: "role",
        model: "role",
        select: "name",
      },
    ]);
  if (!user) {
    res.status(STATUS_Not_Found).send(
      errorResponse(STATUS_Not_Found, {
        message: "User not found or has been deleted!",
      })
    );
    return;
  }
  hashedPass = await comparePassword(req.body.password, user.hashedPassword);
  if (!hashedPass)
    res.status(STATUS_Not_Acceptable).send(
      errorResponse(STATUS_Not_Acceptable, {
        message: "user id and password does not match!",
      })
    );
  // res.status(500).send("user id and password does not match!");
  delete user.hashedPassword;

  try {
    let token = await generateToken(
      user._id,
      user.name,
      user.role.name,
      user.email,
      user.profileImage
    );
    // res.status(200).send({ user: user, token: token });
    res.status(STATUS_OK).send(
      successResponse(
        STATUS_OK,
        { user: user, token: token },
        {
          message: "sign in successfull",
        }
      )
    );
  } catch (error) {
    console.log(error);
    logger.error(errorBody(req.method, req.originalUrl, error.message));
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: error.message,
      })
    );
  }
};

exports.getAll = async (req, res) => {
  let userRecord,
    condition = { isDeleted: false };
  let limit = req.body.limit || 10;
  let offset = req.body.offset || 0;
  if (req.body.search)
    Object.assign(condition, {
      $or: [
        { name: RegExp(req.body.search, "i") },
        { email: RegExp(req.body.search, "i") },
        // { contact: RegExp(`.*/${parseInt(req.body.search)}./*`, "i") },
      ],
    });
  if (req.body.technology)
    Object.assign(condition, {
      technology: Types.ObjectId(req.body.technology),
    });
  if (req.body.role)
    Object.assign(condition, {
      role: Types.ObjectId(req.body.role),
    });
  try {
    userRecord = await userModel.aggregate([
      {
        $match: condition,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          hashedPassword: 0,
        },
      },
      {
        $lookup: {
          from: "technologies",
          let: { techid: "$technology" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$techid"],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "techData",
        },
      },
      {
        $unwind: { preserveNullAndEmptyArrays: true, path: "$techData" },
      },
      {
        $lookup: {
          from: "roles",
          let: { roleid: "$role" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$roleid"],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: "userRole",
        },
      },
      {
        $unwind: "$userRole",
      },
      {
        $facet: {
          result: [{ $skip: offset }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
      {
        $project: {
          result: 1,
          totalCount: { $first: "$totalCount" },
        },
      },
    ]);
    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, userRecord[0], {
        message: "users data fetched",
      })
    );
  } catch (error) {
    console.log(error);
    logger.error(errorBody(req.method, req.originalUrl, error.message));
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: error.message,
      })
    );
  }
};

exports.delete = async (req, res) => {
  let userRecord;
  let user = await userModel.findOne({ _id: req.params.id });
  if (!user) {
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: "user not found or has been deleted!",
      })
    );
    return;
  }
  if (req.currentUser.role != "Admin") {
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: "You are not authorize to delete this user",
      })
    );
    return;
  }
  let payload = {
    isDeleted: true,
    deletedBy: {
      $push: { _user: req.currentUser._id, date: new Date() },
    },
  };
  try {
    userRecord = await userModel.findOneAndUpdate(
      { _id: req.params.id },
      payload,
      { new: true }
    );
    req.userId = req?.currentUser?._id;
    await activityLog.create(req, userRecord, "deleted");
    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, userRecord, {
        message: "deleted!",
      })
    );
  } catch (error) {
    console.log(error);
    logger.error(errorBody(req.method, req.originalUrl, error.message));
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: error.message,
      })
    );
  }
};
exports.edit = async (req, res) => {
  let userRecord;
  let payload = {
    isEdited: true,
    editedBy: {
      $push: { _user: req.currentUser._id, date: new Date() },
    },
  };
  if (req.body.name) Object.assign(payload, { name: req.body.name });
  if (req.body.email) Object.assign(payload, { email: req.body.email });
  if (req.body.contact) Object.assign(payload, { contact: req.body.contact });
  if (req.body.role) Object.assign(payload, { role: req.body.role });
  if (req.body.technology)
    Object.assign(payload, { technology: req.body.technology });
  if (req.file && req.file.filename)
    Object.assign(payload, { profileImage: req.file.filename });
  try {
    userRecord = await userModel.findOneAndUpdate(
      { _id: req.body._id },
      payload,
      { new: true }
    );
    req.userId = req?.currentUser?._id;
    await activityLog.create(req, userRecord, "updated");

    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, userRecord, {
        message: "edited!",
      })
    );
  } catch (error) {
    console.log(error);
    logger.error(errorBody(req.method, req.originalUrl, error.message));
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: error.message,
      })
    );
  }
};
exports.updateFirebaseToken = async (req, res) => {
  let userRecord;
  let payload = {
    isEdited: true,
    editedBy: {
      $push: { _user: req.body._id, date: new Date() },
    },
    firebaseToken: req.body.firebaseToken,
  };
  try {
    userRecord = await userModel.findOneAndUpdate(
      { _id: req.body._id },
      payload,
      { new: true }
    );
    req.userId = req.body._id;
    await activityLog.create(req, userRecord, "updated");

    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, userRecord, {
        message: "edited!",
      })
    );
  } catch (error) {
    console.log(error);
    logger.error(errorBody(req.method, req.originalUrl, error.message));
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: error.message,
      })
    );
  }
};
async function hashPassword(plaintextPassword) {
  try {
    const hash = await bcrypt.hash(plaintextPassword, 10); // Store hash in the database
    return hash;
  } catch (error) {
    console.log(error);
    return new Error(error);
  }
}

// compare password
async function comparePassword(plaintextPassword, hash) {
  try {
    const result = await bcrypt.compare(plaintextPassword, hash);
    return result;
  } catch (error) {
    return new Error(error);
  }
}
async function generateToken(id, name, role, email, profileImage) {
  return jwt.sign(
    {
      id,
      name,
      role,
      email,
      profileImage,
    },
    "testjsonwebtoken",
    { expiresIn: 30 * 60 * 60 }
  );
}
