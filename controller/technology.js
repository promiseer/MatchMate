const { Types } = require("mongoose");
const technologyModel = require("../schema/technology");
const activityLog = require("../helpers/activityLog");

exports.create = async (req, res) => {
  let payload = {
    ...req.body,
    image: req.file.filename || "",
    createdBy: { _user: req.currentUser._id, date: new Date() },
  };
  try {
    let technologyRecord = await technologyModel.create(payload);
    req.userId = req?.currentUser?._id;
    await activityLog.create(req, technologyRecord, "inserted");
    if (technologyRecord)
      res.status(STATUS_OK).send(
        successResponse(STATUS_OK, technologyRecord, {
          message: "technology created!",
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
exports.getAll = async (req, res) => {
  let technologyRecord;
  let condition = { isDeleted: false };
  let limit = req.body.limit || 10;
  let offset = req.body.offset || 0;
  if (req.body.search)
    Object.assign(condition, { name: RegExp(req.body.search, "i") });
  try {
    technologyRecord = await technologyModel.aggregate([
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
      successResponse(STATUS_OK, technologyRecord[0], {
        message: "technology fetched",
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
exports.getSingle = async (req, res) => {
  let technologyRecord;
  try {
    technologyRecord = await technologyModel.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, technologyRecord[0], {
        message: "technology fetched",
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
  let technologyRecord;
  let payload = {
    isEdited: true,
    editedBy: {
      $push: { _user: req.currentUser._id, date: new Date() },
    },
  };
  if (req.body.name) Object.assign(payload, { name: req.body.name });
  if (req.body.title) Object.assign(payload, { title: req.body.title });
  if (req.body.description)
    Object.assign(payload, { description: req.body.description });
  if (req.file && req.file.filename)
    Object.assign(payload, { image: req.file.filename });
  try {
    technologyRecord = await technologyModel.findOneAndUpdate(
      { _id: req.body._id },
      payload,
      { new: true }
    );
    req.userId = req?.currentUser?._id;
    await activityLog.create(req, technologyRecord, "updated");
    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, technologyRecord, {
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
exports.delete = async (req, res) => {
  let technologyRecord;
  let technology = await technologyModel.findOne({ _id: req.params.id });
  if (!technology) {
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: "technology not found or has been deleted!",
      })
    );
    return;
  }

  // technology.createdBy._user != Types.ObjectId(req.currentUser._id) ||
  if (req.currentUser.role != "Admin") {
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: "You are not authorize to delete this technology",
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
    technologyRecord = await technologyModel.findOneAndUpdate(
      { _id: req.params.id },
      payload,
      { new: true }
    );
    req.userId = req?.currentUser?._id;
    await activityLog.create(req, technologyRecord, "deleted");
    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, technologyRecord, {
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
