import * as walletService from "../services/wallet.service.js";
import * as addressService from "../services/address.service.js";
import * as cartService from "../services/cart.service.js";
import * as checkoutService from "../services/checkout.service.js";
import * as orderService from "../services/order.service.js";

// Wallet
export async function getWallet(req, res, next) {
  try {
    const wallet = await walletService.getWallet(req.user.userId);
    res.json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
}

export async function topUp(req, res, next) {
  try {
    const wallet = await walletService.topUp({
      userId: req.user.userId,
      amount: req.body.amount,
    });
    res.json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
}

export async function getTransactions(req, res, next) {
  try {
    const transactions = await walletService.getTransactions(req.user.userId);
    res.json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
}

// Address
export async function getAddresses(req, res, next) {
  try {
    const addresses = await addressService.getAddresses(req.user.userId);
    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
}

export async function createAddress(req, res, next) {
  try {
    const address = await addressService.createAddress({
      userId: req.user.userId,
      ...req.body,
    });
    res.status(201).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(req, res, next) {
  try {
    const address = await addressService.updateAddress({
      userId: req.user.userId,
      addressId: parseInt(req.params.id),
      data: req.body,
    });
    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req, res, next) {
  try {
    await addressService.deleteAddress({
      userId: req.user.userId,
      addressId: parseInt(req.params.id),
    });
    res.json({ success: true, message: "Address deleted" });
  } catch (error) {
    next(error);
  }
}

// Cart
export async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.user.userId);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
}

export async function addCartItem(req, res, next) {
  try {
    const cart = await cartService.addCartItem({
      buyerId: req.user.userId,
      productId: req.body.productId,
      quantity: req.body.quantity,
    });
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const cart = await cartService.updateCartItem({
      buyerId: req.user.userId,
      itemId: parseInt(req.params.id),
      quantity: req.body.quantity,
    });
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
}

export async function deleteCartItem(req, res, next) {
  try {
    const cart = await cartService.deleteCartItem({
      buyerId: req.user.userId,
      itemId: parseInt(req.params.id),
    });
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
}

// Checkout
export async function checkoutPreview(req, res, next) {
  try {
    const preview = await checkoutService.getCheckoutPreview({
      buyerId: req.user.userId,
      addressId: req.body.addressId,
      deliveryMethod: req.body.deliveryMethod,
      discountCode: req.body.discountCode,
    });
    res.json({ success: true, data: preview });
  } catch (error) {
    next(error);
  }
}

export async function checkout(req, res, next) {
  try {
    const order = await checkoutService.checkout({
      buyerId: req.user.userId,
      addressId: req.body.addressId,
      deliveryMethod: req.body.deliveryMethod,
      discountCode: req.body.discountCode,
    });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

// Orders
export async function getOrders(req, res, next) {
  try {
    const orders = await orderService.getBuyerOrders(req.user.userId);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await orderService.getBuyerOrderById({
      userId: req.user.userId,
      orderId: parseInt(req.params.id),
    });
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

export async function getReport(req, res, next) {
  try {
    const report = await orderService.getBuyerReport(
      req.user.userId,
      req.query.dateFrom,
      req.query.dateTo
    );
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}
