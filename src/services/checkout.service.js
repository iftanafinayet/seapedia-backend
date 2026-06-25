import prisma from "../config/prisma.js";
import { BadRequestError } from "../utils/errors.js";

const DELIVERY_FEES = {
  Instant: 25000,
  NextDay: 15000,
  Regular: 10000,
};

const TAX_RATE = 0.12;

export async function checkout({ buyerId, addressId, deliveryMethod, discountCode }) {
  const cart = await prisma.cart.findUnique({
    where: { buyerId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new BadRequestError("Cart is empty");
  }

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: buyerId },
  });
  if (!address) {
    throw new BadRequestError("Address not found");
  }

  if (!DELIVERY_FEES[deliveryMethod]) {
    throw new BadRequestError("Invalid delivery method");
  }

  const storeId = cart.items[0].product.storeId;

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    throw new BadRequestError("Store no longer exists");
  }

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new BadRequestError(`Insufficient stock for product '${item.product.name}'`);
    }
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let discountAmount = 0;
  let voucherUsed = null;
  let promoUsed = null;

  if (discountCode) {
    const voucher = await prisma.voucher.findUnique({ where: { code: discountCode } });
    const promo = await prisma.promo.findUnique({ where: { code: discountCode } });

    const disc = voucher || promo;
    if (!disc) {
      throw new BadRequestError("Invalid discount code");
    }

    if (new Date(disc.expiryDate) < new Date()) {
      throw new BadRequestError("Discount code has expired");
    }

    if (disc.minOrder && subtotal < disc.minOrder) {
      throw new BadRequestError(
        `Minimum order amount is ${disc.minOrder} to use this discount`
      );
    }

    if (voucher && voucher.usedCount >= voucher.usageLimit) {
      throw new BadRequestError("Voucher usage limit reached");
    }

    // Check if cart contains deal-of-the-day products
    const hasDealProduct = cart.items.some((item) => item.product.isDealOfTheDay);
    if (hasDealProduct && voucher && !voucher.applicableToDeals) {
      throw new BadRequestError("This voucher is not applicable to Deals of the Day products");
    }

    if (disc.discountType === "Percentage") {
      discountAmount = subtotal * (disc.discountValue / 100);
    } else {
      discountAmount = disc.discountValue;
    }

    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    if (voucher) voucherUsed = voucher;
    if (promo) promoUsed = promo;
  }

  const amountAfterDiscount = subtotal - discountAmount;
  const taxAmount = parseFloat((amountAfterDiscount * TAX_RATE).toFixed(2));
  const deliveryFee = DELIVERY_FEES[deliveryMethod];
  const finalTotal = parseFloat(
    (amountAfterDiscount + taxAmount + deliveryFee).toFixed(2)
  );

  const wallet = await prisma.wallet.findUnique({ where: { userId: buyerId } });
  if (!wallet || wallet.balance < finalTotal) {
    throw new BadRequestError(
      "Insufficient wallet balance. Please top up your wallet."
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // Deduct stock
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Deduct wallet
    await tx.wallet.update({
      where: { userId: buyerId },
      data: { balance: { decrement: finalTotal } },
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount: -finalTotal,
        type: "Payment",
        description: `Payment for order at store ${store.name}`,
      },
    });

    // Create order
    const order = await tx.order.create({
      data: {
        buyerId,
        storeId,
        addressId,
        deliveryMethod,
        totalAmount: subtotal,
        deliveryFee,
        discountAmount,
        taxAmount,
        finalTotal,
        status: "SedangDikemas",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
        statusHistory: {
          create: {
            status: "SedangDikemas",
            notes: "Order placed",
          },
        },
      },
      include: {
        items: true,
        statusHistory: true,
      },
    });

    // Increment voucher usage
    if (voucherUsed) {
      await tx.voucher.update({
        where: { id: voucherUsed.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  });

  return result;
}

export async function getCheckoutPreview({ buyerId, addressId, deliveryMethod, discountCode }) {
  const cart = await prisma.cart.findUnique({
    where: { buyerId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: buyerId },
  });
  if (!address) {
    throw new Error("Address not found");
  }

  if (!DELIVERY_FEES[deliveryMethod]) {
    throw new Error("Invalid delivery method");
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let discountAmount = 0;
  let discountError = null;

  if (discountCode) {
    const voucher = await prisma.voucher.findUnique({ where: { code: discountCode } });
    const promo = await prisma.promo.findUnique({ where: { code: discountCode } });
    const disc = voucher || promo;

    if (!disc) {
      discountError = "Invalid discount code";
    } else if (new Date(disc.expiryDate) < new Date()) {
      discountError = "Discount code has expired";
    } else if (disc.minOrder && subtotal < disc.minOrder) {
      discountError = `Minimum order Rp${disc.minOrder.toLocaleString()} to use this code`;
    } else if (voucher && voucher.usedCount >= voucher.usageLimit) {
      discountError = "Voucher usage limit reached";
    } else if (voucher) {
      const hasDealProduct = cart.items.some((item) => item.product.isDealOfTheDay);
      if (hasDealProduct && !voucher.applicableToDeals) {
        discountError = "Voucher not applicable to Deals of the Day products";
      }
    }

    if (!discountError) {
      if (disc.discountType === "Percentage") {
        discountAmount = subtotal * (disc.discountValue / 100);
      } else {
        discountAmount = disc.discountValue;
      }
      if (discountAmount > subtotal) discountAmount = subtotal;
    }
  }

  const amountAfterDiscount = subtotal - discountAmount;
  const taxAmount = parseFloat((amountAfterDiscount * TAX_RATE).toFixed(2));
  const deliveryFee = DELIVERY_FEES[deliveryMethod];
  const finalTotal = parseFloat(
    (amountAfterDiscount + taxAmount + deliveryFee).toFixed(2)
  );

  return {
    subtotal,
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    discountError,
    taxAmount,
    deliveryFee,
    finalTotal,
    items: cart.items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    })),
  };
}
