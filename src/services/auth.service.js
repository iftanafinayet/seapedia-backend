import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";
import { generateAuthToken, generateRoleToken } from "../utils/token.js";
import { BadRequestError, ConflictError, UnauthorizedError } from "../utils/errors.js";

export async function register({ username, email, password, roles }) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existing) {
    if (existing.username === username) {
      throw new ConflictError("Username already taken");
    }
    throw new ConflictError("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      roles,
    },
  });

  const token = generateAuthToken(user);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    },
    token,
  };
}

export async function login({ identifier, password }) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
    },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const token = generateAuthToken(user);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    },
    token,
  };
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      roles: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  return user;
}

export async function setActiveRole(userId, activeRole) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new BadRequestError("User not found");
  }

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

export async function getFinancialSummary(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, roles: true, createdAt: true },
  });

  if (!user) throw new UnauthorizedError("User not found");

  const summary = { roles: user.roles };

  // Buyer wallet
  if (user.roles.includes("Buyer")) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    summary.buyerWallet = wallet ? { balance: wallet.balance } : { balance: 0 };
  }

  // Seller income
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

  // Driver earnings
  if (user.roles.includes("Driver")) {
    const earnings = await prisma.driverEarning.findMany({
      where: { driverId: userId },
    });
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
