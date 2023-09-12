const activityLogModel = require("../schema/activityLog");

exports.create = async (req, data, description) => {
  let payload = {
    data: data,
    url: req.originalUrl,
    method: req.method,
    host: req.headers.host,
    description: description || "",
    createdBy: { _user: req.userId, date: new Date() },
  };
  try {
    let activityLogRecord = await activityLogModel.create(payload);
    return activityLogRecord;
  } catch (error) {
    console.log(error);
    return error;
  }
};
