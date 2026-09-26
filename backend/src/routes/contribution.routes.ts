import { Router } from "express";
import {
  create,
  update,
  review,
  getById,
  getByCollaboration,
  getApprovedByContent,
} from "../controllers/contribution.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, create);
router.get("/:id", authenticate, getById);
router.put("/:id", authenticate, update);
router.put("/:id/review", authenticate, review);
router.get("/collaboration/:collaborationRequestId", authenticate, getByCollaboration);
router.get("/content/:contentId/approved", authenticate, getApprovedByContent);

export default router;
