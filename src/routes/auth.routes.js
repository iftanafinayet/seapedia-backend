import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import * as generalController from "../controllers/general.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginLimiter } from "../middleware/rateLimiter.js";
import { schemas } from "../utils/validation.js";

const router = Router();

router.post("/register", validate(schemas.register), authController.register);
router.post("/login", loginLimiter, validate(schemas.login), authController.login);
router.post("/logout", authenticate, generalController.logout);
router.get("/profile", authenticate, authController.getProfile);
router.post("/active-role", authenticate, validate(schemas.activeRole), authController.setActiveRole);

export default router;
