const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema(
  {
    image: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: {
      _user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      date: { type: Date, default: new Date() },
    },
    technology: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedBy: [
      {
        _user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        date: { type: Date, default: new Date() },
      },
    ],
    editedBy: [
      {
        _user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        date: { type: Date, default: new Date() },
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("blog", blogSchema);
