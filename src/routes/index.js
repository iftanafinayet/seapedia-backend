import { Router } from "express";
import authRoutes from "./auth.routes.js";
import publicRoutes from "./public.routes.js";
import sellerRoutes from "./seller.routes.js";
import buyerRoutes from "./buyer.routes.js";
import driverRoutes from "./driver.routes.js";
import adminRoutes from "./admin.routes.js";
import uploadRoutes from "./upload.routes.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/roleGuard.js";
import * as publicController from "../controllers/public.controller.js";
import { optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { schemas } from "../utils/validation.js";
import * as generalController from "../controllers/general.controller.js";
import * as siteConfigController from "../controllers/admin.controller.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/public", publicRoutes);
router.use("/seller", sellerRoutes);
router.use("/buyer", buyerRoutes);
router.use("/driver", driverRoutes);
router.use("/admin", adminRoutes);
router.use("/upload", uploadRoutes);

// Public endpoint aliases (PRD Section 5.1 — flat /api/ prefix)
router.get("/products", publicController.getProducts);
router.get("/products/top-rated", publicController.getTopRatedProducts);
router.get("/products/:id/reviews", publicController.getProductReviews);
router.post("/products/:id/reviews", optionalAuth, validate(schemas.review), publicController.createProductReview);
router.get("/products/:id", publicController.getProductById);
router.get("/stores/:id", publicController.getStoreById);
router.get("/reviews", publicController.getReviews);
router.post("/reviews", optionalAuth, validate(schemas.review), publicController.createReview);
router.get("/deals", publicController.getDealsOfTheDay);
router.get("/site-config", siteConfigController.getSiteConfig);
router.get("/active-discounts", publicController.getActiveDiscounts);

// General endpoints (PRD Section 5.7)
router.get(
  "/orders/:id",
  authenticate,
  authorize("Buyer", "Seller", "Admin"),
  generalController.getOrderById
);

export default router;
