import { env } from "./env.js";

export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: "15m",
  roleExpiry: {
    Buyer: "4h",
    Driver: "2d",
    Seller: "7d",
    Admin: "7d",
  },
};
