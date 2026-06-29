import { v2 as cloudinary } from 'cloudinary';
import prisma from "../config/prisma.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { extractPublicId } from "../utils/cloudinary.js";

export async function getPublicProducts(page = 1, limit = 20, search, sort, category) {
  const where = {};
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (category) {
    where.category = category;
  }

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

export async function createProduct({ name, description, price, stock, imageUrl, images, sellerId }) {
  const store = await prisma.store.findUnique({ where: { sellerId } });
  if (!store) {
    throw new NotFoundError("You don't have a store yet");
  }

  return prisma.product.create({
    data: { name, description, price, stock, imageUrl, images, storeId: store.id },
  });
}

function collectImageIds(product) {
  const ids = [];
  if (product.imageUrl) {
    const id = extractPublicId(product.imageUrl);
    if (id) ids.push(id);
  }
  if (product.images) {
    try {
      const urls = JSON.parse(product.images);
      if (Array.isArray(urls)) {
        for (const url of urls) {
          const id = extractPublicId(url);
          if (id) ids.push(id);
        }
      }
    } catch {}
  }
  return ids;
}

async function deleteCloudinaryImages(ids) {
  if (ids.length === 0) return;
  await Promise.all(ids.map(id => cloudinary.uploader.destroy(id).catch(() => {})));
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

  const updated = await prisma.product.update({
    where: { id: productId },
    data,
  });

  const oldIds = collectImageIds(product);
  const newIds = collectImageIds(updated);
  const removed = oldIds.filter(id => !newIds.includes(id));
  deleteCloudinaryImages(removed);

  return updated;
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

  const ids = collectImageIds(product);
  await prisma.product.delete({ where: { id: productId } });
  deleteCloudinaryImages(ids);
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
