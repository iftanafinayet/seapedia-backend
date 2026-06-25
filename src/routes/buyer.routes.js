import { Router } from "express";
import * as buyerController from "../controllers/buyer.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/roleGuard.js";
import { validate } from "../middleware/validate.js";
import { schemas } from "../utils/validation.js";

const router = Router();

router.use(authenticate);
router.use(authorize("Buyer"));

// Wallet
router.get("/wallet", buyerController.getWallet);
router.post("/wallet/topup", validate(schemas.topUp), buyerController.topUp);
router.get("/wallet/transactions", buyerController.getTransactions);

// Addresses
router.get("/addresses", buyerController.getAddresses);
router.post("/addresses", validate(schemas.address), buyerController.createAddress);
router.put("/addresses/:id", validate(schemas.addressUpdate), buyerController.updateAddress);
router.delete("/addresses/:id", buyerController.deleteAddress);

// Cart
router.get("/cart", buyerController.getCart);
router.post("/cart/items", validate(schemas.cartItem), buyerController.addCartItem);
router.put("/cart/items/:id", validate(schemas.cartItemUpdate), buyerController.updateCartItem);
router.delete("/cart/items/:id", buyerController.deleteCartItem);

// Checkout
router.post("/checkout/preview", validate(schemas.checkout), buyerController.checkoutPreview);
router.post("/checkout", validate(schemas.checkout), buyerController.checkout);

// Orders
router.get("/orders", buyerController.getOrders);
router.get("/orders/:id", buyerController.getOrderById);
router.get("/report", buyerController.getReport);

export default router;
