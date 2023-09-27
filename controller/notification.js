const { Types } = require("mongoose");
const notificationModel = require("../schema/notification");
const userModel = require("../schema/user");
const activityLog = require("../helpers/activityLog");
const notification = require("../helpers/firebaseNotification");
exports.create = async (req, res) => {
  let notificationRecord;
  let userCondition = {
    firebaseToken: { $exists: true },
    isDeleted: false,
    _id: { $ne: Types.ObjectId(req.currentUser._id) },
  };
  if (req.body.technology)
    Object.assign(userCondition, {
      technology: Types.ObjectId(req.body.technology),
    });
  const users = await userModel.find(userCondition);
  if (!users.length)
    res.status(STATUS_Not_Found).send(
      errorResponse(STATUS_Not_Found, {
        message: "No users found!",
      })
    );
  let payload = {
    ...req.body,
    receivers: users.map((x) => ({
      userid: x._id,
    })),
    sender: req.currentUser._id,
  };
  if (req.file && req.file.filename)
    Object.assign(payload, { image: req.file.filename });
  try {
    notificationRecord = await notificationModel.create(payload);
    let data = {
      notificationId: notificationRecord._id.toString(),
      priority: notificationRecord.priority,
    };
    notification.send_notification(
      notificationRecord.title,
      notificationRecord.body,
      data,
      users.map((x) => x.firebaseToken)
    );
    if (notificationRecord)
      res.status(STATUS_OK).send(
        successResponse(STATUS_OK, notificationRecord, {
          message: "notification created!",
        })
      );

    Object.assign(notificationRecord._doc, { senderData: req.currentUser });
    io.to(req.body.technology).emit("recieveNotification", notificationRecord);
    req.userId = req?.currentUser?._id;
    await activityLog.create(req, notificationRecord, "inserted");
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
  let notificationRecord;
  let condition = {},
    userCondition = {};
  let limit = req?.body?.limit || 100;
  let offset = req?.body?.offset || 0;
  if (req.body.userid)
    Object.assign(condition, {
      "receivers.userid": Types.ObjectId(req.body.userid),
    });
  if (req?.body?.isSeen)
    Object.assign(condition, { "receivers.isSeen": false });
  if (req.body.sender) {
    delete condition["receivers.userid"];
    Object.assign(condition, { sender: Types.ObjectId(req.body.sender) });
  }
  if (req.body.search) {
    Object.assign(condition, { title: RegExp(req.body.search, "i") });
  }
  if (req.body.senderName)
    Object.assign(userCondition, { name: RegExp(req.body.senderName, "i") });
  try {
    notificationRecord = await notificationModel.aggregate([
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
          userSeen: {
            $filter: {
              input: "$receivers",
              as: "user",
              cond: {
                $and: [
                  {
                    $eq: ["$$user.userid", Types.ObjectId(req.currentUser._id)],
                  },
                  {
                    $eq: ["$$user.isSeen", true],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          isSeen: {
            $in: [Types.ObjectId(req.body.userid), "$userSeen.userid"], // it works now
          },
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userid: "$sender" },
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
                from: "technologies",
                let: {
                  techid: "$technology",
                },
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
              $unwind: "$techData",
            },
            {
              $project: {
                name: 1,
                email: 1,
                profileImage: 1,
                role: 1,
                techData: 1,
              },
            },
          ],
          as: "senderData",
        },
      },
      {
        $unwind: "$senderData",
      },
      {
        $facet: {
          result: [{ $skip: offset }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
          totalUnseen: [{ $group: { _id: "$isSeen", count: { $sum: 1 } } }],
        },
      },
      {
        $project: {
          result: 1,
          totalCount: { $first: "$totalCount" },
          isAllSeen: { $allElementsTrue: ["$result.isSeen"] },
          totalUnseen: 1,
        },
      },
    ]);
    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, notificationRecord[0], {
        message: "notification fetched",
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
exports.seen = async (req, res) => {
  let notificationRecord;
  let payload = {
    $set: { "receivers.$.isSeen": true },
  };
  try {
    notificationRecord = await notificationModel.findOneAndUpdate(
      {
        _id: req.body._id,
        "receivers.userid": Types.ObjectId(req.currentUser._id),
      },
      payload,
      { new: true }
    );
    let sender = await userModel
      .findOne({ _id: notificationRecord.sender })
      .select("name email profileImage role");
    console.log(sender);
    Object.assign(notificationRecord._doc, {
      senderData: sender,
      isSeen: true,
    });
    req.userId = req?.currentUser?._id;
    await activityLog.create(req, notificationRecord, "seen");
    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, notificationRecord, {
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
exports.getSingle = async (req, res) => {
  let notificationRecord;
  let notification = await notificationModel
    .findOne({ _id: req.params.id })
    .populate([
      {
        path: "technology",
        model: "technology",
        select: "name",
      },
      {
        path: "sender",
        model: "user",
        select: "name profileImage",
      },
    ]);
  if (!notification) {
    res.status(STATUS_INTERNAL_SERVER_ERROR).send(
      errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
        message: "notification not found or has been deleted!",
      })
    );
    return;
  }
  try {
    notificationRecord = notification;
    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, notificationRecord, {
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
exports.setStatus = async (req, res) => {
  let statusRecord;
  let request = await notificationModel.findOne({
    _id: req.body.reqId,
    sender: req.currentUser._id,
  });
  if (!request) {
    res.status(STATUS_Not_Found).send(
      errorResponse(STATUS_Not_Found, {
        message: "No request found or you are not sender of this request!",
      })
    );
    return;
  }
  try {
    statusRecord = await notificationModel.findOneAndUpdate(
      { _id: req.body.reqId },
      {
        status: req.body.status,
      },
      { new: true }
    );
    if (statusRecord)
      res.status(STATUS_OK).send(
        successResponse(STATUS_OK, statusRecord, {
          message: "notification fetched",
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
