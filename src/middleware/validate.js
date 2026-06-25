import { BadRequestError } from "../utils/errors.js";

export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join("; ");
      throw new BadRequestError(messages);
    }

    req.body = value;
    next();
  };
}
