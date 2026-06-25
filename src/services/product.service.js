import prisma from "../config/prisma.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

export async function getPublicProducts(page = 1, limit = 20, search, sort) {
  const where = search
    ? { name: { contains: search, mode: "insensitive" } }
    : {};

  let orderBy = { createdAt: "desc" };
  if (sort === "popular") orderBy = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { store: { select: { id: true, name: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    }),
    prisma.product.count({ where }),
  ]);

  return { data: products, page, limit, total };
}

export async function getPublicProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: { select: { id: true, name: true } } },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
}

export async function getSellerProducts(sellerId) {
  const store = await prisma.store.findUnique({ where: { sellerId } });
  if (!store) {
    throw new NotFoundError("You don't have a store yet");
  }

  return prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProduct({ name, description, price, stock, sellerId }) {
  const store = await prisma.store.findUnique({ where: { sellerId } });
  if (!store) {
    throw new NotFoundError("You don't have a store yet");
  }

  return prisma.product.create({
    data: { name, description, price, stock, storeId: store.id },
  });
}

export async function updateProduct({ productId, sellerId, data }) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const store = await prisma.store.findUnique({ where: { sellerId } });
  if (!store || product.storeId !== store.id) {
    throw new ForbiddenError("You can only update your own products");
  }

  return prisma.product.update({
    where: { id: productId },
    data,
  });
}

export async function deleteProduct({ productId, sellerId }) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const store = await prisma.store.findUnique({ where: { sellerId } });
  if (!store || product.storeId !== store.id) {
    throw new ForbiddenError("You can only delete your own products");
  }

  await prisma.product.delete({ where: { id: productId } });
}

export async function getProductsByStore(storeId) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    throw new NotFoundError("Store not found");
  }

  return prisma.product.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDealsOfTheDay() {
  return prisma.product.findMany({
    where: { isDealOfTheDay: true },
    include: { store: { select: { id: true, name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });
}

export async function getAllProductsForAdmin() {
  return prisma.product.findMany({
    include: { store: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function toggleDealProduct(productId) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new NotFoundError("Product not found");

  return prisma.product.update({
    where: { id: productId },
    data: { isDealOfTheDay: !product.isDealOfTheDay },
    include: { store: { select: { id: true, name: true } } },
  });
}
