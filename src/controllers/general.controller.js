import prisma from "../config/prisma.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";

export async function getOrderById(req, res, next) {
  try {
    const orderId = parseInt(req.params.id);
    const userId = req.user.userId;
    const activeRole = req.activeRole;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { id: true, name: true, price: true } } } },
        store: { select: { id: true, name: true, sellerId: true } },
        statusHistory: { orderBy: { createdAt: "asc" } },
        deliveryJob: true,
        address: true,
      },
    });

    if (!order) throw new NotFoundError("Order not found");

    const isBuyer = activeRole === "Buyer" && order.buyerId === userId;
    const isSeller = activeRole === "Seller" && order.store.sellerId === userId;
    const isAdmin = activeRole === "Admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new ForbiddenError("You don't have access to this order");
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

export async function logout(_req, res) {
  res.json({ success: true, message: "Logged out (token should be discarded by client)" });
}
