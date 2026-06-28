import { ForbiddenError, BadRequestError } from "../utils/errors.js";

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    const activeRole = req.user?.activeRole;

    if (!activeRole) {
      throw new BadRequestError("Token tidak memiliki role yang aktif. Silakan pilih role terlebih dahulu.");
    }

    if (!allowedRoles.includes(activeRole)) {
      throw new ForbiddenError(
        `Role '${activeRole}' tidak diizinkan mengakses resource ini`
      );
    }

    if (!req.user.roles.includes(activeRole)) {
      throw new ForbiddenError(
        `Kamu tidak memiliki role '${activeRole}'. Role kamu: [${req.user.roles.join(", ")}]`
      );
    }

    req.activeRole = activeRole;
    next();
  };
}
