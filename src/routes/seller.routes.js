import { Router } from "express";
import * as sellerController from "../controllers/seller.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/roleGuard.js";
import { validate } from "../middleware/validate.js";
import { schemas } from "../utils/validation.js";

const router = Router();

router.use(authenticate);
router.use(authorize("Seller"));

router.post("/store", validate(schemas.store), sellerController.createStore);
router.put("/store", validate(schemas.store), sellerController.updateStore);
router.get("/store", sellerController.getMyStore);

router.get("/products", sellerController.getProducts);
router.post("/products", validate(schemas.product), sellerController.createProduct);
router.put("/products/:id", validate(schemas.productUpdate), sellerController.updateProduct);
router.delete("/products/:id", sellerController.deleteProduct);

router.get("/orders", sellerController.getOrders);
router.put("/orders/:id/process", sellerController.processOrder);

router.get("/report", sellerController.getReport);

export default router;
