const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 9000;
const app = express();
const fs = require("fs");
app.use(cors());
app.use(express.json({ limit: "10MB" }));
app.use(express.urlencoded({ extended: true }));
require("./helpers/responseHandler");
require("./helpers/statusCodes");
require("./helpers/logger");
require("./routes/index")(app);
// Function to serve all static files
// inside public directory.
app.use(express.static("public"));
app.use("/asset", express.static("public"));

var folders = ["public", "public/uploads"];

folders.forEach(function (f) {
  if (!fs.existsSync(f)) {
    fs.mkdirSync(f);
  }
});
const folderPath = "public/uploads";
// app.use("/samcom", routes);
fs.readdirSync(folderPath);
app.get("/", (req, res) => res.send("SMTP is running"));
app.get("/samcom", (req, res) => res.send(`blog running on port ${port}`));
app.use(function (err, req, res, next) {
  console.error(err.stack);
  logger.error(err);
  res.status(STATUS_INTERNAL_SERVER_ERROR).send(
    errorResponse(STATUS_INTERNAL_SERVER_ERROR, {
      message: err.message,
    })
  );
});
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Connection successfull ${process.env.MONGODB_URI}`);
  })
  .catch((e) => {
    console.log("Connection failed!");
  });
var server = app.listen(port, () => {
  console.log(`app is running on ${port}`);
});

global.io = require("socket.io")(server, {
  cors:
    // "*",
    {
      origin: process.env.ORIGIN,
      // cors: { origin: "*" },
      methods: ["GET", "POST"],
      transport: ["websocket"],
      credentials: true,
    },
  allowEIO3: true,
});
io.on("connection", function (socket) {
  console.log("Socket Connection Established with ID :" + socket.id);

  socket.on("joinRoom", (room, user) => {
    socket.join(room.technology);
    io.to(room.technology).emit("memberJoined", user);
  });
  socket.on("sendNotification", async (notification) => {
    // console.log(notification);
    // let api = await utils.Notification(notification.id);
    // console.log(api);
    // console.log(io.sockets.adapter.rooms);
    // io.to(notification.technology).emit("recieveNotification", api);
  });
  socket.on("disconnect", (reason) => {
    console.log("user disconnected", reason);
  });
});
module.exports = app;
