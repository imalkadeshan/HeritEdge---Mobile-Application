import { Router } from "express";
import {
  list,
  unreadCount,
  markRead,
  markAllRead,
} from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, list);
router.get("/unread-count", authenticate, unreadCount);
router.put("/:id/read", authenticate, markRead);
router.put("/read-all", authenticate, markAllRead);

export default router;
