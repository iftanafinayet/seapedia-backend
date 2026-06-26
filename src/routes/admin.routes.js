import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/roleGuard.js";
import { validate } from "../middleware/validate.js";
import { schemas } from "../utils/validation.js";

const router = Router();

router.use(authenticate);
router.use(authorize("Admin"));

router.get("/dashboard", adminController.getDashboard);
router.post("/process-overdue", adminController.processOverdue);
router.post("/simulate-next-day", adminController.simulateNextDay);

// Vouchers
router.get("/vouchers", adminController.getVouchers);
router.post("/vouchers", validate(schemas.discount), adminController.createVoucher);
router.get("/vouchers/:id", adminController.getVoucherById);
router.put("/vouchers/:id", validate(schemas.discountUpdate), adminController.updateVoucher);
router.delete("/vouchers/:id", adminController.deleteVoucher);

// Promos
router.get("/promos", adminController.getPromos);
router.post("/promos", validate(schemas.promo), adminController.createPromo);
router.get("/promos/:id", adminController.getPromoById);
router.put("/promos/:id", validate(schemas.promoUpdate), adminController.updatePromo);
router.delete("/promos/:id", adminController.deletePromo);

// Deal of the Day
router.get("/products", adminController.getProducts);
router.put("/products/:id/deal", adminController.toggleDealProduct);

// Site Config
router.get("/site-config", adminController.getSiteConfig);
router.put("/site-config", adminController.updateSiteConfig);

export default router;
