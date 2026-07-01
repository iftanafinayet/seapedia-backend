import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import { jwtConfig } from "../config/jwt.js";
import {
  generateAuthToken,
  generateRoleToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateTokenId,
} from "../utils/token.js";
import { BadRequestError, ConflictError, UnauthorizedError } from "../utils/errors.js";

function parseExpiry(exp) {
  const match = exp.match(/^(\d+)([smhd])$/);
  if (!match) return { ms: 7 * 24 * 60 * 60 * 1000, string: "7d" };
  const num = parseInt(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return { ms: num * (multipliers[unit] || 86400000), string: exp };
}

async function createRefreshTokenRecord(userId, activeRole) {
  const tokenId = generateTokenId();
  const roleKey = activeRole || "Buyer";
  const expString = jwtConfig.refreshExpiry[roleKey] || "7d";
  const parsed = parseExpiry(expString);
  const expiresAt = new Date(Date.now() + parsed.ms);

  const refreshToken = generateRefreshToken({
    userId,
    activeRole,
    jti: tokenId,
  });

  await prisma.refreshToken.create({
    data: { token: tokenId, userId, expiresAt },
  });

  return refreshToken;
}

export async function register({ username, email, password, roles }) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });

  if (existing) {
    if (existing.username === username) throw new ConflictError("Username already taken");
    throw new ConflictError("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword, roles },
  });

  const accessToken = generateAuthToken(user);
  const refreshToken = await createRefreshTokenRecord(user.id, roles[0]);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    },
    token: accessToken,
    refreshToken,
  };
}

export async function login({ identifier, password }) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier }] },
  });

  if (!user) throw new UnauthorizedError("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new UnauthorizedError("Invalid credentials");

  const accessToken = generateAuthToken(user);
  const refreshToken = await createRefreshTokenRecord(user.id, user.roles[0]);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    },
    token: accessToken,
    refreshToken,
  };
}

export async function refreshToken(refreshTokenStr) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshTokenStr);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: decoded.jti },
  });

  if (!stored || stored.revokedAt) {
    throw new UnauthorizedError("Refresh token has been revoked");
  }

  if (stored.expiresAt < new Date()) {
    throw new UnauthorizedError("Refresh token has expired");
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) throw new UnauthorizedError("User not found");

  // Rotate: revoke old token, issue new one
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const activeRole = decoded.activeRole || user.roles[0];
  const newAccessToken = activeRole
    ? generateRoleToken(user, activeRole)
    : generateAuthToken(user);
  const newRefreshToken = await createRefreshTokenRecord(user.id, activeRole);

  return {
    token: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    },
    activeRole,
  };
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, roles: true, createdAt: true },
  });

  if (!user) throw new UnauthorizedError("User not found");
  return user;
}

export async function setActiveRole(userId, activeRole) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new BadRequestError("User not found");

  if (activeRole !== "Admin" && !user.roles.includes(activeRole)) {
    throw new BadRequestError(`You do not have the role '${activeRole}'`);
  }

  const token = generateRoleToken(user, activeRole);

  return {
    activeRole,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    },
  };
}

export async function logout(userId, refreshTokenStr) {
  if (refreshTokenStr) {
    try {
      const decoded = verifyRefreshToken(refreshTokenStr);
      await prisma.refreshToken.updateMany({
        where: { token: decoded.jti, userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Invalid token, ignore
    }
  }
}

export async function logoutAll(userId) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getFinancialSummary(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, roles: true, createdAt: true },
  });

  if (!user) throw new UnauthorizedError("User not found");

  const summary = { roles: user.roles };

  if (user.roles.includes("Buyer")) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    summary.buyerWallet = wallet ? { balance: wallet.balance } : { balance: 0 };
  }

  if (user.roles.includes("Seller")) {
    const store = await prisma.store.findUnique({ where: { sellerId: userId } });
    if (store) {
      const completedOrders = await prisma.order.findMany({
        where: { storeId: store.id, status: "PesananSelesai" },
      });
      const totalIncome = completedOrders.reduce((sum, o) => sum + (o.totalAmount - o.discountAmount), 0);
      summary.sellerIncome = {
        storeName: store.name,
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        completedOrders: completedOrders.length,
      };
    } else {
      summary.sellerIncome = { storeName: null, totalIncome: 0, completedOrders: 0 };
    }
  }

  if (user.roles.includes("Driver")) {
    const earnings = await prisma.driverEarning.findMany({ where: { driverId: userId } });
    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const completedJobs = await prisma.deliveryJob.count({
      where: { driverId: userId, status: "Delivered" },
    });
    summary.driverEarnings = {
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      completedJobs,
    };
  }

  return summary;
}
