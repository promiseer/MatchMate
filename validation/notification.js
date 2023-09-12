const Joi = require("joi");

const technology = {
  create: Joi.object({
    title: Joi.string().required(),
    priority: Joi.string().required(),
    body: Joi.string().required(),
    technology: Joi.string().required(),
    image: Joi.any(),
  }),
  getAll: Joi.object({
    search: Joi.string().allow(""),
    offset: Joi.number().allow(0),
    limit: Joi.number(),
    userid: Joi.string().allow(""),
    sender: Joi.string(),
    senderName: Joi.string().allow(""),
  }),
  seen: Joi.object({
    _id: Joi.string().required(),
  }),
  getSingle: Joi.object({
    id: Joi.string().required(),
  }),
  setStatus: Joi.object({
    // sender: Joi.string().required(),
    reqId: Joi.string().required(),
    status: Joi.string().valid("resolved", "re-open").required(),
  }),
};
module.exports = technology;
