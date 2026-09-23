import { Router } from "express";
import { berthPlanController } from "../controllers/BerthPlanController";

const router = Router();

router.get("/", berthPlanController.list);
router.post("/", berthPlanController.create);
router.get("/:id/candidates", berthPlanController.candidates);
router.patch("/:id/reassign", berthPlanController.reassign);

export default router;
