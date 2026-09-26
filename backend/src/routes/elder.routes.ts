import { Router } from "express";
import { discover, getById } from "../controllers/elder.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, discover);
router.get("/:id", authenticate, getById);

export default router;
