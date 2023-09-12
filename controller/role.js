const { Types } = require("mongoose");
const roleModel = require("../schema/role");
const activityLog = require("../helpers/activityLog");

exports.create = async (req, res) => {
  let payload = {
    ...req.body,
    createdBy: { _user: req.currentUser._id, date: new Date() },
  };
  try {
    let roleRecord = await roleModel.create(payload);
    req.userId = req?.currentUser?._id;
    await activityLog.create(req, roleRecord, "inserted");
    if (roleRecord)
      res.status(STATUS_OK).send(
        successResponse(STATUS_OK, roleRecord, {
          message: "role created!",
        })
      );
  } catch (error) {
    console.log(error);
    logger.error(errorBody(req.method, req.originalUrl, error.message));
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: err.message,
      })
    );
  }
};
exports.getAll = async (req, res) => {
  let roleRecord;
  let condition = { isDeleted: false };
  let limit = req.body.limit || 10;
  let offset = req.body.offset || 0;
  if (req.body.search)
    Object.assign(condition, {
      name: RegExp(req.body.search, "i"),
    });
  try {
    roleRecord = await roleModel.aggregate([
      {
        $match: condition,
      },
      {
        $sort: { createdAt: -1 },
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
      successResponse(STATUS_OK, roleRecord[0], {
        message: "role fetched",
      })
    );
  } catch (error) {
    console.log(error);
    logger.error(errorBody(req.method, req.originalUrl, error.message));

    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: err.message,
      })
    );
  }
};
exports.edit = async (req, res) => {
  let roleRecord;
  let payload = {
    isEdited: true,
    editedBy: {
      $push: { _user: req.currentUser._id, date: new Date() },
    },
  };
  if (req.body.name) Object.assign(payload, { name: req.body.name });
  try {
    roleRecord = await roleModel.findOneAndUpdate(
      { _id: req.body._id },
      payload,
      { new: true }
    );
    req.userId = req?.currentUser?._id;
    await activityLog.create(req, roleRecord, "updated");
    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, roleRecord, {
        message: "edited!",
      })
    );
  } catch (error) {
    console.log(error);
    logger.error(errorBody(req.method, req.originalUrl, error.message));
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: err.message,
      })
    );
  }
};
exports.delete = async (req, res) => {
  let roleRecord;
  let role = await roleModel.findOne({ _id: req.params.id });
  if (!role) {
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: "role not found or has been deleted!",
      })
    );
    return;
  }
  if (req.currentUser.role != "Admin") {
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: "You are not authorize to delete this role",
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
    roleRecord = await roleModel.findOneAndUpdate(
      { _id: req.params.id },
      payload,
      { new: true }
    );
    req.userId = req?.currentUser?._id;
    await activityLog.create(req, roleRecord, "deleted");
    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, roleRecord, {
        message: "deleted!",
      })
    );
  } catch (error) {
    console.log(error);
    logger.error(errorBody(req.method, req.originalUrl, error.message));
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: err.message,
      })
    );
  }
};
