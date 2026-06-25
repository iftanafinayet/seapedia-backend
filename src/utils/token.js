import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";

export function generateToken(payload) {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
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
