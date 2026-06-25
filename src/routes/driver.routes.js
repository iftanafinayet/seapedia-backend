import { Router } from "express";
import * as driverController from "../controllers/driver.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/roleGuard.js";

const router = Router();

router.use(authenticate);
router.use(authorize("Driver"));

router.get("/jobs", driverController.getAvailableJobs);
router.get("/jobs/:id", driverController.getJobDetail);
router.post("/jobs/:id/take", driverController.takeJob);
router.post("/jobs/:id/complete", driverController.completeJob);
router.get("/my-jobs", driverController.getMyJobs);
router.get("/earnings", driverController.getEarnings);

export default router;
