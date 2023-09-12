const { Types } = require("mongoose");
const activityModel = require("../schema/activityLog");

exports.getAll = async (req, res) => {
  let activityRecord;
  let condition = {};
  let limit = req.body.limit || 5;
  let offset = req.body.offset || 0;
  let userCondition = {};
  if (req.body.search) {
    Object.assign(condition, {
      $or: [
        { description: RegExp(req.body.search, "i") },
        { url: RegExp(req.body.search, "i") },
      ],
    });
  }
  if (req.currentUser.role != "Admin")
    Object.assign(condition, {
      "createdBy._user": Types.ObjectId(req.currentUser._id),
    });
  if (req.body.email)
    Object.assign(userCondition, { email: RegExp(req.body.email, "i") });
  try {
    activityRecord = await activityModel.aggregate([
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
              //timezone: "+08:00",
              //onNull:"unspecified",
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
                contact: 1,
                role: 1,
                userRole: 1,
              },
            },
          ],
          as: "userData",
        },
      },
      {
        $unwind: { path: "$userData" },
      },
      {
        $facet: {
          result: [
            { $skip: offset },
            { $limit: limit },
            {
              $project: {
                data: 0,
              },
            },
          ],
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
      successResponse(STATUS_OK, activityRecord[0], {
        message: "activity fetched",
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
