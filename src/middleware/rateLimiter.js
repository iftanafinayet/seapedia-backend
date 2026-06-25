import rateLimit from "express-rate-limit";
import { TooManyRequestsError } from "../utils/errors.js";

export const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler: (_req, _res, next, options) => {
    next(new TooManyRequestsError("Too many login attempts. Please try again after 1 minute."));
  },
});

export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});
