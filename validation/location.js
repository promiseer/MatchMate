const Joi = require("joi");
let location = {
  createLocation: Joi.object({
    location: Joi.string().required(),
    Latitude: Joi.string().required(),
    Longitude: Joi.string().required(),
  }),
  edit: Joi.object({
    _id: Joi.string().required(),
    location: Joi.string().required(),
    Latitude: Joi.string().required(),
    Longitude: Joi.string().required(),
  }),
  updateFirebaseToken: Joi.object({
    _id: Joi.string().required(),
    firebaseToken: Joi.any().allow(null).required(),
  }),
  signin: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};
module.exports = location;
