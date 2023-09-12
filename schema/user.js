const mongoose = require("mongoose");

let userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true },
    contact: { type: Number },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roles",
      required: true,
    },
    profileImage: { type: String },
    hashedPassword: String,
    technology: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "technologies",
      required: ["Please select technology"],
    },
    isActive: { type: Boolean, default: true },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    firebaseToken: { type: String },
    createdBy: {
      type: String,
      enum: ["self", "admin"],
      default: "admin",
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
userSchema.methods.toJSON = function () {
  var obj = this.toObject(); //or var obj = this;
  delete obj.hashedPassword;
  return obj;
};
module.exports = mongoose.model("user", userSchema);
