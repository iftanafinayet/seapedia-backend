import { Router } from "express";
import * as publicController from "../controllers/public.controller.js";
import { optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { schemas } from "../utils/validation.js";

const router = Router();

router.get("/products", publicController.getProducts);
router.get("/products/:id", publicController.getProductById);
router.get("/stores/:id", publicController.getStoreById);
router.post("/reviews", optionalAuth, validate(schemas.review), publicController.createReview);
router.get("/reviews", publicController.getReviews);

export default router;
