import { env } from "../config/env.js";

export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message;

  if (env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}
