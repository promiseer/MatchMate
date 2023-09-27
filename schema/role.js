const mongoose = require("mongoose");
const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
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
module.exports = mongoose.model("role", roleSchema);
