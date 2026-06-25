export function sanitizeString(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function sanitizeObject(obj, fields) {
  if (!obj || typeof obj !== "object") return obj;
  const result = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key of Object.keys(result)) {
    if (fields.includes(key) && typeof result[key] === "string") {
      result[key] = sanitizeString(result[key]);
    } else if (typeof result[key] === "object" && result[key] !== null) {
      result[key] = sanitizeObject(result[key], fields);
    }
  }
  return result;
}

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
