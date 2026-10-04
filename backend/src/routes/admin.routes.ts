import { Router, Response } from "express";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth.middleware";
import {
  listAll,
  create,
  updateLabel,
  updateStatus,
  remove as removeCategory,
} from "../controllers/category.controller";
import { list as listUsers, setStatus as setUserStatus } from "../controllers/adminUsers.controller";
import { dashboard } from "../controllers/adminDashboard.controller";
import {
  list as listContent,
  detail as detailContent,
  edit as editContent,
  remove as removeContent,
} from "../controllers/adminContent.controller";

const router = Router();

// Server-side proof that admin authorisation is enforced by middleware.

router.get(
  "/session",
  authenticate,
  requireRole("admin"),
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      message: "Admin access granted",
      userId: req.userId,
      role: req.userRole,
    });
  }
);

// ---- Admin dashboard ----
// Counts + bounded recent activity. Same double gate as every route below:
// anonymous callers 401, elder/youth 403, and only an admin sees data.

router.get("/dashboard", authenticate, requireRole("admin"), dashboard);

// ---- HE-34 Registered users (read only) ----
// Paginated, searchable list of accounts. No write endpoints for users are
// added here: viewing accounts must never imply changing them.

router.get("/users", authenticate, requireRole("admin"), listUsers);
// Account status: the only write on this resource. Disabling blocks sign-in
// and API access immediately (authenticate re-reads the flag) while keeping
// the profile, cultural content and all linked records. No deletion happens.
router.put("/users/:id/status", authenticate, requireRole("admin"), setUserStatus);

// ---- HE-35 Cultural content management ----
// The admin's view of every Elder's items: list, inspect, edit and delete.
// Each route re-checks the stored role, so elders and youth always get 403
// and anonymous callers 401. Deletes run the shared cleanup policy in
// content.service (saved rows, collaboration requests, contributions,
// notifications, image and audio files) - the same policy an Elder's own
// delete uses, only the ownership check differs.

router.get("/content", authenticate, requireRole("admin"), listContent);
router.get("/content/:id", authenticate, requireRole("admin"), detailContent);
router.put("/content/:id", authenticate, requireRole("admin"), editContent);
router.delete(
  "/content/:id",
  authenticate,
  requireRole("admin"),
  removeContent
);

// ---- HE-36 Content categories ----
// Every write below is admin-only; Elder and Youth accounts get 403.

router.get("/categories", authenticate, requireRole("admin"), listAll);
router.post("/categories", authenticate, requireRole("admin"), create);
router.put("/categories/:id", authenticate, requireRole("admin"), updateLabel);
router.put(
  "/categories/:id/status",
  authenticate,
  requireRole("admin"),
  updateStatus
);
// Permanent delete of one category. The service refuses (409) when cultural
// content still stores the category's key or when boot seeding would simply
// re-create it, so nothing referenced is ever lost through this route.
router.delete(
  "/categories/:id",
  authenticate,
  requireRole("admin"),
  removeCategory
);

export default router;
