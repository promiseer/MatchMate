const { Types } = require("mongoose");
const blogModel = require("../schema/blog");
const activityLog = require("../helpers/activityLog");

exports.create = async (req, res) => {
  let payload = {
    ...req.body,
    createdBy: { _user: req.currentUser._id, date: new Date() },
  };
  if (req.file && req.file.filename)
    Object.assign(payload, { image: req.file.filename });
  try {
    let blogRecord = await blogModel.create(payload);
    if (blogRecord)
      res.status(STATUS_OK).send(
        successResponse(STATUS_OK, blogRecord, {
          message: "blog created!",
        })
      );
    req.userId = req?.currentUser?._id;
    await activityLog.create(req, blogRecord, "inserted");
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
  let blogRecord;
  let condition = { isDeleted: false };
  let techCondition = {},
    userCondition = {};
  let limit = req.body.limit || 10;
  let offset = req.body.offset || 0;
  if (req.body.search)
    Object.assign(condition, {
      title: RegExp(req.body.search, "i"),
      // $or: [
      //   { title: RegExp(req.body.search, "i") },
      //   { description: RegExp(req.body.search, "i") },
      // ],
    });
  if (req.body.technology && req.body.technology.length)
    Object.assign(condition, {
      technology: { $in: req.body.technology },
    });
  if (req.body.userid)
    Object.assign(condition, {
      "createdBy._user": Types.ObjectId(req.body.userid),
    });
  if (req.body.techName) {
    Object.assign(techCondition, { name: RegExp(req.body.techName, "i") });
  }
  if (req.body.userName) {
    Object.assign(userCondition, { name: RegExp(req.body.userName, "i") });
  }
  try {
    blogRecord = await blogModel.aggregate([
      {
        $match: condition,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $addFields: {
          convertedDate: {
            $dateToString: {
              format: "%d-%m-%Y",
              date: "$createdAt",
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userid: "$createdBy._user" },
          pipeline: [
            {
              $match: {
                ...userCondition,
                $expr: {
                  $eq: ["$_id", "$$userid"],
                },
              },
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
              $project: {
                name: 1,
                email: 1,
                profileImage: 1,
                role: 1,
                userRole: 1,
              },
            },
          ],
          as: "userData",
        },
      },
      {
        $unwind: "$userData",
      },
      {
        $lookup: {
          from: "technologies",
          let: {
            techid: "$technology",
          },
          pipeline: [
            {
              $match: {
                ...techCondition,
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
        $unwind: "$techData",
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
      successResponse(STATUS_OK, blogRecord[0], {
        message: "blog fetched",
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
  let blogRecord;
  let payload = {
    isEdited: true,
    editedBy: {
      $push: { _user: req.currentUser._id, date: new Date() },
    },
  };
  if (req.body.title) Object.assign(payload, { title: req.body.title });
  if (req.body.description)
    Object.assign(payload, { description: req.body.description });
  if (req.body.technology)
    Object.assign(payload, { technology: req.body.technology });
  if (req.file && req.file.filename)
    Object.assign(payload, { image: req.file.filename });
  try {
    blogRecord = await blogModel.findOneAndUpdate(
      { _id: req.body._id },
      payload,
      { new: true }
    );
    req.userId = req?.currentUser?._id;
    await activityLog.create(req, blogRecord, "updated");
    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, blogRecord, {
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
  let blogRecord;
  let blog = await blogModel.findOne({ _id: req.params.id });
  if (!blog) {
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: "Blog not found or has been deleted!",
      })
    );
    return;
  }
  // blog.createdBy._user != Types.ObjectId(req.currentUser._id) ||

  if (req.currentUser.role != "Admin") {
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: "You are not authorize to delete this blog",
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
    blogRecord = await blogModel.findOneAndUpdate(
      { _id: req.params.id },
      payload,
      { new: true }
    );
    req.userId = req?.currentUser?._id;
    await activityLog.create(req, blogRecord, "deleted");
    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, blogRecord, {
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
exports.getSingle = async (req, res) => {
  let blogRecord;
  let blog = await blogModel.findOne({ _id: req.params.id }).populate([
    {
      path: "technology",
      model: "technology",
      select: "name",
    },
    {
      path: "createdBy._user",
      model: "user",
      select: "name profileImage",
    },
  ]);
  if (!blog) {
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: "Blog not found or has been deleted!",
      })
    );
    return;
  }
  try {
    blogRecord = blog;
    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, blogRecord, {
        message: "Fetched!",
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
