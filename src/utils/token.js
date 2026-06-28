import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";

export function generateToken(payload, customExpiry) {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: customExpiry || jwtConfig.expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, jwtConfig.secret);
}

export function generateAuthToken(user) {
  return generateToken({
    userId: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
  });
}

export function generateRoleToken(user, activeRole) {
  const expiresIn = jwtConfig.roleExpiry[activeRole] || "7d";
  return generateToken(
    {
      userId: user.id,
      username: user.username,
      roles: user.roles,
      activeRole,
    },
    expiresIn
  );
}
