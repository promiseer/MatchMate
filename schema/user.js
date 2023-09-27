const mongoose = require("mongoose");

let userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true },
    bio: { type: String, required: true },
    dateofBirth: { type: String, required: true },
    gender: { type: String, required: true },
    location: { type: String, required: true },
    Latitude:{type: String, required: true},
    Longitude:{type: String, required: true},
    contact: { type: Number },
    PreferredGender: {type: String},
    PreferredAgeMin: {type: Number},
    PreferredAgeMax: {type: Number},
    Age: {type: Number,},
    // Pictures: {type: String, required: true},
    School: {type: String},
    Interests: {type: String},
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roles",
      required: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "locations",
    },
    profileImage: { type: String },
    hashedPassword: String,
    // technology: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "technologies",
    //   required: ["Please select technology"],
    // },
    isActive: { type: Boolean, default: true },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    firebaseToken: { type: String },
    createdBy: {
      type: String,
      enum: ["self", "User"],
      default: "User",
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
