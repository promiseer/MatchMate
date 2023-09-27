const Joi = require("joi");

const role = {
  create: Joi.object({
    name: Joi.string().required(),
  }),
  getAll: Joi.object({
    search: Joi.string().allow(""),
    offset: Joi.number().allow(0),
    limit: Joi.number(),
  }),
  edit: Joi.object({
    _id: Joi.string().required(),
    name: Joi.string(),
  }),
};
module.exports = role;
