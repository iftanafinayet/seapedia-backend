import prisma from "../config/prisma.js";
import { BadRequestError, NotFoundError, ConflictError } from "../utils/errors.js";

export async function createVoucher({ code, discountType, discountValue, minOrder, expiryDate, usageLimit, applicableToDeals, createdBy }) {
  const existing = await prisma.voucher.findUnique({ where: { code } });
  if (existing) throw new ConflictError("Voucher code already exists");

  const normalizedType = discountType.charAt(0).toUpperCase() + discountType.slice(1).toLowerCase();

  return prisma.voucher.create({
    data: { code, discountType: normalizedType, discountValue, minOrder, expiryDate: new Date(expiryDate), usageLimit, applicableToDeals: applicableToDeals || false, createdBy },
  });
}

export async function createPromo({ code, discountType, discountValue, minOrder, expiryDate, createdBy }) {
  const existing = await prisma.promo.findUnique({ where: { code } });
  if (existing) throw new ConflictError("Promo code already exists");

  const normalizedType = discountType.charAt(0).toUpperCase() + discountType.slice(1).toLowerCase();

  return prisma.promo.create({
    data: { code, discountType: normalizedType, discountValue, minOrder, expiryDate: new Date(expiryDate), createdBy },
  });
}

export async function getVouchers() {
  return prisma.voucher.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getPromos() {
  return prisma.promo.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getVoucherById(id) {
  const voucher = await prisma.voucher.findUnique({ where: { id } });
  if (!voucher) throw new NotFoundError("Voucher not found");
  return voucher;
}

export async function updateVoucher(id, { code, discountType, discountValue, minOrder, expiryDate, usageLimit, applicableToDeals }) {
  const voucher = await prisma.voucher.findUnique({ where: { id } });
  if (!voucher) throw new NotFoundError("Voucher not found");

  if (code && code !== voucher.code) {
    const existing = await prisma.voucher.findUnique({ where: { code } });
    if (existing) throw new ConflictError("Voucher code already exists");
  }

  return prisma.voucher.update({
    where: { id },
    data: {
      ...(code && { code }),
      ...(discountType && { discountType: discountType.charAt(0).toUpperCase() + discountType.slice(1).toLowerCase() }),
      ...(discountValue !== undefined && { discountValue }),
      ...(minOrder !== undefined ? { minOrder } : {}),
      ...(expiryDate && { expiryDate: new Date(expiryDate) }),
      ...(usageLimit !== undefined ? { usageLimit } : {}),
      ...(applicableToDeals !== undefined ? { applicableToDeals } : {}),
    },
  });
}

export async function deleteVoucher(id) {
  const voucher = await prisma.voucher.findUnique({ where: { id } });
  if (!voucher) throw new NotFoundError("Voucher not found");
  return prisma.voucher.delete({ where: { id } });
}

export async function updatePromo(id, { code, discountType, discountValue, minOrder, expiryDate }) {
  const promo = await prisma.promo.findUnique({ where: { id } });
  if (!promo) throw new NotFoundError("Promo not found");

  if (code && code !== promo.code) {
    const existing = await prisma.promo.findUnique({ where: { code } });
    if (existing) throw new ConflictError("Promo code already exists");
  }

  return prisma.promo.update({
    where: { id },
    data: {
      ...(code && { code }),
      ...(discountType && { discountType: discountType.charAt(0).toUpperCase() + discountType.slice(1).toLowerCase() }),
      ...(discountValue !== undefined && { discountValue }),
      ...(minOrder !== undefined ? { minOrder } : {}),
      ...(expiryDate && { expiryDate: new Date(expiryDate) }),
    },
  });
}

export async function deletePromo(id) {
  const promo = await prisma.promo.findUnique({ where: { id } });
  if (!promo) throw new NotFoundError("Promo not found");
  return prisma.promo.delete({ where: { id } });
}

export async function getPromoById(id) {
  const promo = await prisma.promo.findUnique({ where: { id } });
  if (!promo) throw new NotFoundError("Promo not found");
  return promo;
}

export async function getActiveDiscounts() {
  const now = new Date();

  const [vouchers, promos] = await Promise.all([
    prisma.voucher.findMany({
      where: { expiryDate: { gte: now } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.promo.findMany({
      where: { expiryDate: { gte: now } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activeVouchers = vouchers.filter((v) => v.usedCount < v.usageLimit);

  return {
    vouchers: activeVouchers,
    promos,
  };
}
