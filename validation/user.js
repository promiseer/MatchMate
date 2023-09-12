const Joi = require("joi");

let user = {
  register: Joi.object({
    name: Joi.string().required(),
    email: Joi.string()
      .required()
      .regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      .messages({
        "string.base": `"email" should be a type of 'text'`,
        "string.empty": `"email" cannot be an empty field`,
        "any.required": `"email" is a required field`,
        "string.pattern.base": `please enter valid email id`,
      }),
    contact: Joi.number().required(),
    password: Joi.string(),
    profileImage: Joi.any(),
    role: Joi.string().required(),
    technology: Joi.string().required(),
  }),
  edit: Joi.object({
    _id: Joi.string().required(),
    name: Joi.string(),
    email: Joi.string()
      .regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      .messages({
        "string.base": `"email" should be a type of 'text'`,
        "string.empty": `"email" cannot be an empty field`,
        "any.required": `"email" is a required field`,
        "string.pattern.base": `please enter valid email id`,
      }),
    contact: Joi.number(),
    password: Joi.string()
      .required()
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/)
      .messages({
        "string.base": `"password" should be a type of 'text'`,
        "string.empty": `"password" cannot be an empty field`,
        "any.required": `"password" is a required field`,
        "string.pattern.base":
          "password should contain at least one lowercase letter, one uppercase letter, one digit, one special character and is at least eight characters long",
      }),
    profileImage: Joi.string(),
    role: Joi.string(),
    technology: Joi.string(),
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
module.exports = user;
