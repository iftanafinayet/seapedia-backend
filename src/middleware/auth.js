import { UnauthorizedError } from "../utils/errors.js";
import { verifyToken } from "../utils/token.js";
import prisma from "../config/prisma.js";

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      roles: user.roles,
      activeRole: decoded.activeRole || null,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Invalid or expired token"));
    }
    next(error);
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (user) {
      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        roles: user.roles,
        activeRole: decoded.activeRole || null,
      };
    }
  } catch {
    // Not authenticated, continue as guest
  }

  next();
}
