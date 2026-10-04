import { Router } from "express";
import { create, update, remove, getMine, getAll, getById } from "../controllers/content.controller";
import { uploadContentImage, removeContentImage } from "../controllers/image.controller";
import { uploadContentAudio, removeContentAudio } from "../controllers/audio.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Reads stay open to every signed-in member: elders and youth both browse,
// and the detail screen is shared between the roles (HE-27).
router.get("/", authenticate, getAll);
router.get("/mine", authenticate, getMine);
router.get("/:id", authenticate, getById);

// Writing new cultural content is an elder action. The gate reads the stored
// role from the database, so it works for the token issued at registration
// (no re-login after role selection) and can never be satisfied by a stale
// claim in an old token.
router.post(
  "/",
  authenticate,
  requireRole("elder", { message: "Only elders can create content" }),
  create
);

// Ownership of an existing item is re-checked inside the controller/service:
// only the creator may edit or delete, whatever their role.
router.put("/:id", authenticate, update);
router.delete("/:id", authenticate, remove);

// HE-23: the only way imageUrl can change. Ownership is verified inside the
// controller, before the multipart body is parsed.
router.post("/:id/image", authenticate, uploadContentImage);
router.delete("/:id/image", authenticate, removeContentImage);

// HE-26: same contract for audioUrl.
router.post("/:id/audio", authenticate, uploadContentAudio);
router.delete("/:id/audio", authenticate, removeContentAudio);

export default router;
