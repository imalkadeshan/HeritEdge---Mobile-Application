import { Router } from "express";
import { create, update, remove, getMine, getAll, getById } from "../controllers/content.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getAll);
router.get("/mine", authenticate, getMine);
router.get("/:id", authenticate, getById);
router.post("/", authenticate, create);
router.put("/:id", authenticate, update);
router.delete("/:id", authenticate, remove);

export default router;
