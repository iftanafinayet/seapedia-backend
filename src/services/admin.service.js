import prisma from "../config/prisma.js";

const SLA_HOURS = {
  Instant: 24,
  NextDay: 48,
  Regular: 72,
};

export async function getAdminDashboard() {
  const [
    userCount,
    storeCount,
    productCount,
    orderCount,
    voucherCount,
    promoCount,
    deliveryJobCount,
    onDeliveryOrders,
    refundedOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.voucher.count(),
    prisma.promo.count(),
    prisma.deliveryJob.count(),
    prisma.order.findMany({
      where: { status: "SedangDikirim" },
      include: {
        store: { select: { id: true, name: true } },
        buyer: { select: { id: true, username: true } },
      },
    }),
    prisma.order.findMany({
      where: { status: "Dikembalikan" },
      include: {
        store: { select: { id: true, name: true } },
        buyer: { select: { id: true, username: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  const now = new Date();
  const overdue = onDeliveryOrders.filter((order) => {
    const slaMs = SLA_HOURS[order.deliveryMethod] * 60 * 60 * 1000;
    return now.getTime() - new Date(order.updatedAt).getTime() > slaMs;
  });

  return {
    userCount,
    storeCount,
    productCount,
    orderCount,
    voucherCount,
    promoCount,
    deliveryJobCount,
    totalOnDelivery: onDeliveryOrders.length,
    overdueCount: overdue.length,
    overdueOrders: overdue.map((o) => ({
      id: o.id,
      deliveryMethod: o.deliveryMethod,
      status: o.status,
      finalTotal: o.finalTotal,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      buyer: o.buyer,
      store: o.store,
      hoursSinceUpdate: Math.floor(
        (now.getTime() - new Date(o.updatedAt).getTime()) / (1000 * 60 * 60)
      ),
    })),
    refundedOrders: refundedOrders.map((o) => ({
      id: o.id,
      deliveryMethod: o.deliveryMethod,
      finalTotal: o.finalTotal,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      buyer: o.buyer,
      store: o.store,
    })),
  };
}

// Process overdue orders and auto-refund
export async function processOverdue() {
  const orders = await prisma.order.findMany({
    where: { status: "SedangDikirim" },
    include: {
      items: { include: { product: true } },
      buyer: { include: { wallet: true } },
    },
  });

  const now = new Date();
  const results = [];

  for (const order of orders) {
    const slaMs = SLA_HOURS[order.deliveryMethod] * 60 * 60 * 1000;
    if (now.getTime() - new Date(order.updatedAt).getTime() <= slaMs) {
      continue;
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "Dikembalikan",
            statusHistory: {
              create: { status: "Dikembalikan", notes: "Overdue auto-refund" },
            },
          },
        });

        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        await tx.wallet.update({
          where: { userId: order.buyerId },
          data: { balance: { increment: order.finalTotal } },
        });

        await tx.transaction.create({
          data: {
            walletId: order.buyer.wallet.id,
            amount: order.finalTotal,
            type: "Refund",
            description: `Refund for overdue order #${order.id}`,
          },
        });

        await tx.deliveryJob.updateMany({
          where: { orderId: order.id },
          data: { status: "Delivered", completedAt: new Date() },
        });
      });

      results.push({ orderId: order.id, status: "refunded" });
    } catch (error) {
      results.push({ orderId: order.id, status: "failed", error: error.message });
    }
  }

  return results;
}

// Simulate passing one day for all delivery timelines
export async function simulateNextDay() {
  const activeOrders = await prisma.order.findMany({
    where: {
      status: { in: ["SedangDikemas", "MenungguPengirim", "SedangDikirim"] },
    },
  });

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  let statusAdvanced = 0;
  let deliveryJobsCreated = 0;

  for (const order of activeOrders) {
    let newStatus = order.status;

    if (order.status === "SedangDikemas") {
      newStatus = "MenungguPengirim";
      statusAdvanced++;
    } else if (order.status === "MenungguPengirim") {
      const existingJob = await prisma.deliveryJob.findUnique({ where: { orderId: order.id } });
      if (!existingJob) {
        await prisma.deliveryJob.create({ data: { orderId: order.id, status: "Available" } });
        deliveryJobsCreated++;
      }
      newStatus = "SedangDikirim";
      statusAdvanced++;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        updatedAt: new Date(order.updatedAt.getTime() - 24 * 60 * 60 * 1000),
        ...(newStatus !== order.status && { status: newStatus }),
        ...(newStatus !== order.status && {
          statusHistory: {
            create: {
              status: newStatus,
              notes: `Simulated day advance: ${order.status} → ${newStatus}`,
            },
          },
        }),
      },
    });
  }

  const overdueResult = await processOverdue();

  return {
    simulatedOrders: activeOrders.length,
    statusAdvanced,
    deliveryJobsCreated,
    updatedAt: twentyFourHoursAgo.toISOString(),
    overdueProcessed: overdueResult,
  };
}
