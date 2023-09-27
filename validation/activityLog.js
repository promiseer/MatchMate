const Joi = require("joi");

const activity = {
  getAll: Joi.object({
    offset: Joi.number(),
    limit: Joi.number(),
    search: Joi.string().allow(""),
    userid: Joi.string(),
    email: Joi.string().allow(""),
  }),
};
module.exports = activity;
