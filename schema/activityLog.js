const mongoose = require("mongoose");
const activitylogSchema = new mongoose.Schema(
  {
    data: { type: Object, required: true },
    url: { type: String, required: true },
    method: { type: String, required: true },
    host: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: {
      _user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      date: { type: Date, default: new Date() },
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("activitylog", activitylogSchema);
