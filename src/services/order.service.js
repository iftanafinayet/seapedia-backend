import prisma from "../config/prisma.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../utils/errors.js";

// Buyer orders
export async function getBuyerOrders(buyerId) {
  return prisma.order.findMany({
    where: { buyerId },
    include: {
      items: { include: { product: { select: { id: true, name: true } } } },
      store: { select: { id: true, name: true } },
      statusHistory: { orderBy: { createdAt: "desc" } },
      deliveryJob: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBuyerOrderById({ userId, orderId }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { select: { id: true, name: true, price: true } } } },
      store: { select: { id: true, name: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      deliveryJob: { include: { driver: { select: { id: true, username: true } } } },
      address: true,
    },
  });

  if (!order) throw new NotFoundError("Order not found");
  if (order.buyerId !== userId) throw new ForbiddenError("Not your order");

  return order;
}

// Seller orders
export async function getSellerOrders(sellerId) {
  const store = await prisma.store.findUnique({ where: { sellerId } });
  if (!store) throw new NotFoundError("You don't have a store yet");

  return prisma.order.findMany({
    where: { storeId: store.id },
    include: {
      items: { include: { product: { select: { id: true, name: true } } } },
      buyer: { select: { id: true, username: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Seller: process order (SedangDikemas -> MenungguPengirim)
export async function processOrder({ sellerId, orderId }) {
  const store = await prisma.store.findUnique({ where: { sellerId } });
  if (!store) throw new NotFoundError("You don't have a store yet");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError("Order not found");
  if (order.storeId !== store.id) throw new ForbiddenError("Not your store's order");
  if (order.status !== "SedangDikemas") {
    throw new BadRequestError("Order can only be processed when in 'Sedang Dikemas' status");
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "MenungguPengirim",
      statusHistory: {
        create: { status: "MenungguPengirim", notes: "Seller processed order" },
      },
    },
    include: { statusHistory: { orderBy: { createdAt: "asc" } } },
  });

  // Create delivery job when order is ready for pickup
  await prisma.deliveryJob.create({
    data: { orderId: order.id },
  });

  return updated;
}

// Buyer spending report
export async function getBuyerReport(buyerId, dateFrom, dateTo) {
  const where = { buyerId };
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const totalSpent = orders.reduce((sum, o) => sum + o.finalTotal, 0);
  const totalDiscount = orders.reduce((sum, o) => sum + o.discountAmount, 0);
  const totalTax = orders.reduce((sum, o) => sum + o.taxAmount, 0);
  const totalDelivery = orders.reduce((sum, o) => sum + o.deliveryFee, 0);

  return {
    totalOrders: orders.length,
    totalSpent: parseFloat(totalSpent.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    totalTax: parseFloat(totalTax.toFixed(2)),
    totalDelivery: parseFloat(totalDelivery.toFixed(2)),
    orders,
  };
}

// Seller income report
export async function getSellerReport(sellerId, dateFrom, dateTo) {
  const store = await prisma.store.findUnique({ where: { sellerId } });
  if (!store) throw new NotFoundError("You don't have a store yet");

  const where = { storeId: store.id };
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const completedOrders = orders.filter((o) => o.status === "PesananSelesai");
  const totalIncome = completedOrders.reduce(
    (sum, o) => sum + (o.totalAmount - o.discountAmount),
    0
  );

  return {
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    totalIncome: parseFloat(totalIncome.toFixed(2)),
    orders,
  };
}
