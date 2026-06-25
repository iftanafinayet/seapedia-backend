import * as adminService from "../services/admin.service.js";
import * as discountService from "../services/discount.service.js";
import * as productService from "../services/product.service.js";

export async function getDashboard(req, res, next) {
  try {
    const dashboard = await adminService.getAdminDashboard();
    res.json({ success: true, data: dashboard });
  } catch (error) {
    next(error);
  }
}

export async function processOverdue(req, res, next) {
  try {
    const result = await adminService.processOverdue();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function simulateNextDay(req, res, next) {
  try {
    const result = await adminService.simulateNextDay();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// Vouchers
export async function createVoucher(req, res, next) {
  try {
    const voucher = await discountService.createVoucher({
      ...req.body,
      createdBy: req.user.userId,
    });
    res.status(201).json({ success: true, data: voucher });
  } catch (error) {
    next(error);
  }
}

export async function getVouchers(req, res, next) {
  try {
    const vouchers = await discountService.getVouchers();
    res.json({ success: true, data: vouchers });
  } catch (error) {
    next(error);
  }
}

export async function getVoucherById(req, res, next) {
  try {
    const voucher = await discountService.getVoucherById(parseInt(req.params.id));
    res.json({ success: true, data: voucher });
  } catch (error) {
    next(error);
  }
}

// Promos
export async function createPromo(req, res, next) {
  try {
    const promo = await discountService.createPromo({
      ...req.body,
      createdBy: req.user.userId,
    });
    res.status(201).json({ success: true, data: promo });
  } catch (error) {
    next(error);
  }
}

export async function getPromos(req, res, next) {
  try {
    const promos = await discountService.getPromos();
    res.json({ success: true, data: promos });
  } catch (error) {
    next(error);
  }
}

export async function updateVoucher(req, res, next) {
  try {
    const voucher = await discountService.updateVoucher(parseInt(req.params.id), req.body);
    res.json({ success: true, data: voucher });
  } catch (error) {
    next(error);
  }
}

export async function deleteVoucher(req, res, next) {
  try {
    await discountService.deleteVoucher(parseInt(req.params.id));
    res.json({ success: true, message: "Voucher deleted" });
  } catch (error) {
    next(error);
  }
}

export async function updatePromo(req, res, next) {
  try {
    const promo = await discountService.updatePromo(parseInt(req.params.id), req.body);
    res.json({ success: true, data: promo });
  } catch (error) {
    next(error);
  }
}

export async function deletePromo(req, res, next) {
  try {
    await discountService.deletePromo(parseInt(req.params.id));
    res.json({ success: true, message: "Promo deleted" });
  } catch (error) {
    next(error);
  }
}

export async function getPromoById(req, res, next) {
  try {
    const promo = await discountService.getPromoById(parseInt(req.params.id));
    res.json({ success: true, data: promo });
  } catch (error) {
    next(error);
  }
}

// Deal of the Day
export async function getProducts(req, res, next) {
  try {
    const products = await productService.getAllProductsForAdmin();
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

export async function toggleDealProduct(req, res, next) {
  try {
    const product = await productService.toggleDealProduct(parseInt(req.params.id));
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}
