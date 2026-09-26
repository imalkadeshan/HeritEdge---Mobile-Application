import { Router } from "express";
import {
  sendRequest,
  getOutgoing,
  getIncoming,
  acceptOrReject,
  getWorkspace,
} from "../controllers/collaboration.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, sendRequest);
router.get("/outgoing", authenticate, getOutgoing);
router.get("/incoming", authenticate, getIncoming);
router.get("/:id", authenticate, getWorkspace);
router.put("/:id/decision", authenticate, acceptOrReject);

export default router;
