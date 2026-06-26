import * as productService from "../services/product.service.js";
import * as reviewService from "../services/review.service.js";
import * as storeService from "../services/store.service.js";
import * as discountService from "../services/discount.service.js";

export async function getProducts(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    const sort = req.query.sort;
    const result = await productService.getPublicProducts(page, limit, search, sort);
    res.json({
      success: true,
      data: result.data,
      pagination: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await productService.getPublicProductById(parseInt(req.params.id));
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function createReview(req, res, next) {
  try {
    const review = await reviewService.createReview({
      ...req.body,
      userId: req.user?.userId || null,
    });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
}

export async function getReviews(req, res, next) {
  try {
    const reviews = await reviewService.getReviews();
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
}

export async function getTopRatedProducts(req, res, next) {
  try {
    const products = await reviewService.getTopRatedProducts(4);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

export async function getProductReviews(req, res, next) {
  try {
    const reviews = await reviewService.getProductReviews(parseInt(req.params.id));
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
}

export async function createProductReview(req, res, next) {
  try {
    const review = await reviewService.createProductReview({
      productId: parseInt(req.params.id),
      userId: req.user?.userId || null,
      ...req.body,
    });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
}

export async function getDealsOfTheDay(req, res, next) {
  try {
    const deals = await productService.getDealsOfTheDay();
    res.json({ success: true, data: deals });
  } catch (error) {
    next(error);
  }
}

export async function getStoreById(req, res, next) {
  try {
    const store = await storeService.getStoreById(parseInt(req.params.id));
    res.json({ success: true, data: store });
  } catch (error) {
    next(error);
  }
}

export async function getActiveDiscounts(req, res, next) {
  try {
    const discounts = await discountService.getActiveDiscounts();
    res.json({
      success: true,
      data: {
        vouchers: discounts.vouchers.map((v) => ({
          id: v.id,
          code: v.code,
          discountType: v.discountType,
          discountValue: v.discountValue,
          minOrder: v.minOrder,
          type: "voucher",
        })),
        promos: discounts.promos.map((p) => ({
          id: p.id,
          code: p.code,
          discountType: p.discountType,
          discountValue: p.discountValue,
          minOrder: p.minOrder,
          type: "promo",
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}
