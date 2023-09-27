const Joi = require("joi");

const technology = {
  create: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string(),
    title: Joi.string(),
  }),
  getAll: Joi.object({
    search: Joi.string().allow(""),
    offset: Joi.number().allow(0),
    limit: Joi.number().allow(0),
  }),
  getSingle: Joi.object({
    id: Joi.string().required(),
  }),
  edit: Joi.object({
    _id: Joi.string().required(),
    name: Joi.string(),
    title: Joi.string(),
    description: Joi.string(),
    image: Joi.string(),
  }),
};
module.exports = technology;
