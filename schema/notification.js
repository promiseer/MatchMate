const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String },
    image: { type: String },
    priority: { type: String, enum: ["low", "medium", "high"] },
    technology: { type: mongoose.Schema.Types.ObjectId, ref: "technologies" },
    receivers: [
      {
        userid: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        isSeen: { type: Boolean, default: false },
      },
    ],
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    status: {
      type: String,
      enum: ["resolved", "open", "re-open"],
      default: "open",
    },
  },

  { timestamps: true }
);
module.exports = mongoose.model("notification", notificationSchema);
