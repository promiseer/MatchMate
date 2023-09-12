const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema(
  {
    comment: { type: Object, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "notifications" },
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: "comments" },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "comments" }],
    totalReplies: { type: Number, default: 0 },
    type: { type: String, enum: ["comment", "reply"], default: "comment" },
    isDeleted: { type: Boolean, default: false },
    deletedBy: {
      _user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      date: { type: Date, default: new Date() },
    },
    createdBy: {
      _user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      date: { type: Date, default: new Date() },
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("comment", commentSchema);
