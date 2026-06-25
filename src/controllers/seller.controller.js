import * as storeService from "../services/store.service.js";
import * as productService from "../services/product.service.js";
import * as orderService from "../services/order.service.js";

export async function createStore(req, res, next) {
  try {
    const store = await storeService.createStore({
      ...req.body,
      sellerId: req.user.userId,
    });
    res.status(201).json({ success: true, data: store });
  } catch (error) {
    next(error);
  }
}

export async function updateStore(req, res, next) {
  try {
    const store = await storeService.updateStore({
      ...req.body,
      sellerId: req.user.userId,
    });
    res.json({ success: true, data: store });
  } catch (error) {
    next(error);
  }
}

export async function getMyStore(req, res, next) {
  try {
    const store = await storeService.getMyStore(req.user.userId);
    res.json({ success: true, data: store });
  } catch (error) {
    next(error);
  }
}

export async function getProducts(req, res, next) {
  try {
    const products = await productService.getSellerProducts(req.user.userId);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct({
      ...req.body,
      sellerId: req.user.userId,
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await productService.updateProduct({
      productId: parseInt(req.params.id),
      sellerId: req.user.userId,
      data: req.body,
    });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await productService.deleteProduct({
      productId: parseInt(req.params.id),
      sellerId: req.user.userId,
    });
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req, res, next) {
  try {
    const orders = await orderService.getSellerOrders(req.user.userId);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}

export async function processOrder(req, res, next) {
  try {
    const order = await orderService.processOrder({
      sellerId: req.user.userId,
      orderId: parseInt(req.params.id),
    });
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

export async function getReport(req, res, next) {
  try {
    const report = await orderService.getSellerReport(
      req.user.userId,
      req.query.dateFrom,
      req.query.dateTo
    );
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}
