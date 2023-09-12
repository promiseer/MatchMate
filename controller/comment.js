const { Types } = require("mongoose");
const commentModel = require("../schema/comment");
const postModel = require("../schema/notification");
exports.create = async (req, res) => {
  let commentRecord;
  let post = await postModel.findOne({
    _id: req.body.postId,
    $or: [{ status: "open" }, { status: "re-open" }],
  });
  if (!post) {
    res.status(STATUS_Not_Found).send(
      errorResponse(STATUS_Not_Found, {
        message: "No post found or post has been resolved!",
      })
    );
    return;
  }
  try {
    let comment = await commentModel.create({
      ...req.body,
      "createdBy._user": req.currentUser._id,
    });
    if (req.body.type === "reply") {
      req.body.replyId = comment._id;
      await this.addReply(req);
    }
    commentRecord = await commentModel.aggregate([
      {
        $match: { _id: comment._id },
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
                $expr: {
                  $eq: ["$_id", "$$userid"],
                },
              },
            },
            {
              $project: {
                name: 1,
                profileImage: 1,
              },
            },
          ],
          as: "userData",
        },
      },
      {
        $unwind: "$userData",
      },
    ]);
    res.status(STATUS_OK).send(
      successResponse(STATUS_OK, commentRecord[0], {
        message: "comment created",
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
exports.addReply = async (req) => {
  let commentRecord;
  try {
    commentRecord = await commentModel.findOneAndUpdate(
      {
        _id: Types.ObjectId(req.body.commentId),
      },
      {
        $push: { replies: req.body.replyId },
        $inc: { totalReplies: 1 },
      },
      {
        new: true,
      }
    );
    return commentRecord;
    // res.status(STATUS_OK).send(
    //   successResponse(STATUS_OK, commentRecord, {
    //     message: "reply added",
    //   })
    // );
  } catch (error) {
    console.log(error);
    logger.error(errorBody(req.method, req.originalUrl, error.message));
    return error;
    // res.status(STATUS_INTERNAL_SERVER_ERROR).send(
    //   errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
    //     message: error.message,
    //   })
    // );
  }
};

exports.getAll = async (req, res) => {
  let commentRecord,
    limit = req.body.limit || 10,
    offset = req.body.offset || 0;
  let condition = {
    postId: Types.ObjectId(req.body.postId),
    type: req.body.type || "comment",
  };
  try {
    commentRecord = await commentModel.aggregate([
      {
        $match: condition,
      },
      {
        $addFields: {
          convertedDate: {
            $dateToString: {
              format: "%d-%m-%Y",
              date: "$createdAt",
            },
          },
          // toggle: false,
        },
      },
      // {
      //   $lookup: {
      //     from: "notifications",
      //     let: { notId: "$postId" },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $eq: ["$_id", "$$notId"],
      //           },
      //         },
      //       },
      //     ],
      //     as: "notificationData",
      //   },
      // },
      // {
      //   $unwind: "$notificationData",
      // },
      {
        $lookup: {
          from: "users",
          let: { userid: "$createdBy._user" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$userid"],
                },
              },
            },
            {
              $project: {
                name: 1,
                profileImage: 1,
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
          from: "comments",
          // localField: "replies",
          // foreignField: "_id",
          let: { replyid: "$replies" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$replyid"],
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
                      $expr: {
                        $eq: ["$_id", "$$userid"],
                      },
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      profileImage: 1,
                    },
                  },
                ],
                as: "userData",
              },
            },
            {
              $unwind: "$userData",
            },
          ],
          as: "repliesData",
        },
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
      successResponse(STATUS_OK, commentRecord[0], {
        message: "comments fetched",
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
