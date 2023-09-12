const Joi = require("joi");
const middleware = (schema) => {
  // console.log(schema);

  return (req, res, next) => {
    let payload = {
      ...req.body,
      ...req.params,
    };
    const { error } = schema.validate(payload);
    const valid = error == null;
    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      console.log("error", message);
      res.status(422).json({ error: message });
    }
  };
};
module.exports = middleware;
