module.exports = (app) => {
  app.use("/user", require("./user"));
  app.use("/blog", require("./blog"));
  app.use("/role", require("./role"));
  app.use("/technology", require("./technology"));
  app.use("/activity", require("./activitylogs"));
  app.use("/notification", require("./notification"));
  app.use("/comment", require("./comment"));
};
