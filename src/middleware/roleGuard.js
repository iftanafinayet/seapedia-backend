import { ForbiddenError, BadRequestError } from "../utils/errors.js";

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    const activeRole = req.headers["x-active-role"];

    if (!activeRole) {
      throw new BadRequestError("Active role header (X-Active-Role) is required");
    }

    if (!allowedRoles.includes(activeRole)) {
      throw new ForbiddenError(
        `Role '${activeRole}' is not permitted to access this resource`
      );
    }

    if (!req.user.roles.includes(activeRole)) {
      throw new ForbiddenError(
        `You do not have the '${activeRole}' role. Your roles: [${req.user.roles.join(", ")}]`
      );
    }

    req.activeRole = activeRole;
    next();
  };
}
