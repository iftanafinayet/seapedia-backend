import prisma from "../config/prisma.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

export async function getCart(buyerId) {
  let cart = await prisma.cart.findUnique({
    where: { buyerId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
              storeId: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({ data: { buyerId }, include: { items: true } });
  }

  const storeId = cart.items.length > 0 ? cart.items[0]?.product?.storeId : null;

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return { ...cart, storeId, subtotal };
}

export async function addCartItem({ buyerId, productId, quantity }) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  if (product.stock < quantity) {
    throw new BadRequestError("Insufficient stock");
  }

  let cart = await prisma.cart.findUnique({
    where: { buyerId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { buyerId },
      include: { items: { include: { product: true } } },
    });
  }

  if (cart.items.length > 0 && cart.items[0].product.storeId !== product.storeId) {
    throw new BadRequestError(
      "Cart can only contain items from one store. Please clear your cart first."
    );
  }

  const existing = cart.items.find((item) => item.productId === productId);

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock) {
      throw new BadRequestError("Insufficient stock");
    }
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  return getCart(buyerId);
}

export async function updateCartItem({ buyerId, itemId, quantity }) {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true, product: true },
  });

  if (!cartItem || cartItem.cart.buyerId !== buyerId) {
    throw new NotFoundError("Cart item not found");
  }

  if (quantity > cartItem.product.stock) {
    throw new BadRequestError("Insufficient stock");
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return getCart(buyerId);
}

export async function deleteCartItem({ buyerId, itemId }) {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.buyerId !== buyerId) {
    throw new NotFoundError("Cart item not found");
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  return getCart(buyerId);
}
