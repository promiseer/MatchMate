const mongoose = require("mongoose");
const technologySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    image: { type: String },
    title: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    editedBy: [
      {
        _user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        date: { type: Date, default: new Date() },
      },
    ],
    deletedBy: [
      {
        _user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        date: { type: Date, default: new Date() },
      },
    ],
    createdBy: {
      _user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      date: { type: Date, default: new Date() },
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("technology", technologySchema);
