const Joi = require("joi");

const comment = {
  create: Joi.object({
    comment: Joi.string().required(),
    postId: Joi.string().required(),
    type: Joi.string().valid("comment", "reply").required(),
    commentId: Joi.any(),
  }),
  getAll: Joi.object({
    postId: Joi.string().required(),
    limit: Joi.number(),
    offset: Joi.number(),
    type: Joi.string().valid("comment", "reply"),
  }),
};
module.exports = comment;
