const mongoose = require("mongoose");

let locationSchema = new mongoose.Schema(
  {
    location:{type: String},
    Latitude: { type: String},
    Longitude: { type: String},
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    locationHistory: [{location: { type: String}}, {Latitude: { type: String}},  {Longitude: { type: String}}],
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    firebaseToken: { type: String },
    createdBy: {
      _user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      date: { type: Date, default: new Date() },
    },

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
module.exports = mongoose.model("location", locationSchema);
