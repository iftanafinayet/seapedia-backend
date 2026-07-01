import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";
import crypto from "node:crypto";

export function generateAccessToken(payload) {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, jwtConfig.secret);
}

export function generateRefreshToken(payload) {
  const expiresIn = jwtConfig.refreshExpiry[payload.activeRole || payload.roles?.[0]] || "7d";
  return jwt.sign(payload, jwtConfig.refreshSecret, { expiresIn });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, jwtConfig.refreshSecret);
}

export function generateAuthToken(user) {
  return generateAccessToken({
    userId: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles,
  });
}

export function generateRoleToken(user, activeRole) {
  return generateAccessToken({
    userId: user.id,
    username: user.username,
    roles: user.roles,
    activeRole,
  });
}

export function generateTokenId() {
  return crypto.randomUUID();
}
