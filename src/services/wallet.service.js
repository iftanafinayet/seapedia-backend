import prisma from "../config/prisma.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

export async function getWallet(userId) {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 50 } },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, balance: 0 },
      include: { transactions: true },
    });
  }

  return wallet;
}

export async function topUp({ userId, amount }) {
  let wallet = await prisma.wallet.findUnique({ where: { userId } });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId, balance: amount },
    });
  } else {
    wallet = await prisma.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });
  }

  await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      amount,
      type: "TopUp",
      description: "Wallet top-up",
    },
  });

  return getWallet(userId);
}

export async function getTransactions(userId) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    return [];
  }

  return prisma.transaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
  });
}
