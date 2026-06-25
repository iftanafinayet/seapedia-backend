import prisma from "../config/prisma.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

export async function getAddresses(userId) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
  });
}

export async function createAddress({ userId, label, recipient, phone, addressLine, city, postalCode, isPrimary }) {
  // If this is set as primary, unset any other primary
  if (isPrimary) {
    await prisma.address.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  return prisma.address.create({
    data: { userId, label, recipient, phone, addressLine, city, postalCode, isPrimary: isPrimary || false },
  });
}

export async function updateAddress({ userId, addressId, data }) {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    throw new NotFoundError("Address not found");
  }

  if (data.isPrimary) {
    await prisma.address.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  return prisma.address.update({
    where: { id: addressId },
    data,
  });
}

export async function deleteAddress({ userId, addressId }) {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    throw new NotFoundError("Address not found");
  }

  await prisma.address.delete({ where: { id: addressId } });
}
