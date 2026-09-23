import { Router } from "express";
import { berthPlanController } from "../controllers/BerthPlanController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();
router.get("/", berthPlanController.list);
router.get("/conflicts", berthPlanController.conflicts);
router.get("/overview", berthPlanController.overview);
router.post("/", berthPlanController.create);
router.post("/:id/reassign", rbacMiddleware(["dispatcher", "admin"]), berthPlanController.reassign);
export default router;
