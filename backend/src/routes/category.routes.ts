import { Router } from "express";
import { listActive } from "../controllers/category.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Read-only list of active categories. Elder/Youth pick from this; the list
// is the single source of truth for every category chooser in the app.
router.get("/", authenticate, listActive);

export default router;
