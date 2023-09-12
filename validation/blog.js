const Joi = require("joi");

const blog = {
  create: Joi.object({
    image: Joi.string(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    technology: Joi.string().required(),
  }),
  getAll: Joi.object({
    search: Joi.string().allow(""),
    offset: Joi.number().allow(0),
    limit: Joi.number(),
    technology: Joi.array(),
    userid: Joi.string().allow(""),
    techName: Joi.string().allow(""),
    userName: Joi.string().allow(""),
  }),
  edit: Joi.object({
    _id: Joi.string().required(),
    title: Joi.string(),
    description: Joi.string(),
    technology: Joi.string(),
    image: Joi.string(),
  }),
  getSingle: Joi.object({
    id: Joi.string().required(),
  }),
};
module.exports = blog;
