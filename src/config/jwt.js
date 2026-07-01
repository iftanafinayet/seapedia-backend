import { env } from "./env.js";

export const jwtConfig = {
  secret: env.JWT_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  expiresIn: "15m",
  refreshExpiry: {
    Buyer: "7d",
    Driver: "14d",
    Seller: "30d",
    Admin: "30d",
  },
};
