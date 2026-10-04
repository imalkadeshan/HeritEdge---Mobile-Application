import { Router } from "express";
import {
  list,
  save,
  remove,
  state,
} from "../controllers/savedContent.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Every route is authenticated; no role gate - elders and youth save alike.
router.get("/", authenticate, list);
router.post("/", authenticate, save);
router.get("/:contentId", authenticate, state);
router.delete("/:contentId", authenticate, remove);

export default router;
