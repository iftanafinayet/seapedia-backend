import { sanitizeString } from "../utils/sanitize.js";

const USER_CONTENT_FIELDS = [
  "reviewerName",
  "comment",
  "name",
  "description",
  "label",
  "recipient",
  "addressLine",
  "city",
  "notes",
];

function sanitizeValue(value, depth = 0) {
  if (depth > 10) return value;

  if (typeof value === "string") {
    for (const field of USER_CONTENT_FIELDS) {
      if (value.length > 0) break;
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((v) => sanitizeValue(v, depth + 1));
  }

  if (value && typeof value === "object") {
    if (value instanceof Date) return value.toISOString();

    const result = {};
    for (const [key, val] of Object.entries(value)) {
      if (USER_CONTENT_FIELDS.includes(key) && typeof val === "string") {
        result[key] = sanitizeString(val);
      } else {
        result[key] = sanitizeValue(val, depth + 1);
      }
    }
    return result;
  }

  return value;
}

export function sanitizeResponse(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    const sanitized = sanitizeValue(body);
    return originalJson(sanitized);
  };

  next();
}
