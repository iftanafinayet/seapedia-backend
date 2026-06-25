import prisma from "../config/prisma.js";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors.js";

export async function createStore({ name, description, phone, email, city, addressLine, logoUrl, sellerId }) {
  const existing = await prisma.store.findFirst({
    where: {
      OR: [{ name }, { sellerId }],
    },
  });

  if (existing) {
    if (existing.name === name) {
      throw new ConflictError("Store name already taken");
    }
    throw new BadRequestError("You already have a store");
  }

  return prisma.store.create({
    data: { name, description, phone, email, city, addressLine, logoUrl, sellerId },
  });
}

export async function updateStore({ name, description, phone, email, city, addressLine, logoUrl, sellerId }) {
  if (name) {
    const existing = await prisma.store.findUnique({ where: { name } });
    if (existing && existing.sellerId !== sellerId) {
      throw new ConflictError("Store name already taken");
    }
  }

  const store = await prisma.store.findUnique({ where: { sellerId } });
  if (!store) {
    throw new NotFoundError("Store not found");
  }

  return prisma.store.update({
    where: { sellerId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(city !== undefined && { city }),
      ...(addressLine !== undefined && { addressLine }),
      ...(logoUrl !== undefined && { logoUrl }),
    },
  });
}

export async function getMyStore(sellerId) {
  const store = await prisma.store.findUnique({
    where: { sellerId },
    include: {
      products: true,
      orders: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!store) {
    throw new NotFoundError("You don't have a store yet");
  }

  return store;
}

export async function getStoreById(id) {
  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      products: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!store) {
    throw new NotFoundError("Store not found");
  }

  return store;
}
