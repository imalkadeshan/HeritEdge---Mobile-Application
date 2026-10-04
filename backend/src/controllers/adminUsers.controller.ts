import { Response } from "express";
import {
  listUsers,
  setUserActiveStatus,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MAX_SEARCH_LENGTH,
  ROLE_FILTERS,
  STATUS_FILTERS,
  RoleFilter,
  StatusFilter,
} from "../services/adminUsers.service";
import { AuthRequest } from "../middleware/auth.middleware";

interface ParsedParam {
  value?: string;
  /** The parameter was present but not a plain string (e.g. ?page=1&page=2). */
  invalid?: boolean;
}

function readParam(req: AuthRequest, name: string): ParsedParam {
  const raw = req.query[name];
  if (raw === undefined) return {};
  if (typeof raw !== "string") return { invalid: true };
  const trimmed = raw.trim();
  return trimmed ? { value: trimmed } : {};
}

/**
 * HE-34: the admin's registered-user list. Authorisation comes from the
 * route (`authenticate` + `requireRole("admin")`), so elders and youth get
 * 403 here and anonymous callers 401. Everything in this handler is read
 * only - no role writes, no deletions, no password handling.
 */export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    // ---- page ----
    const pageParam = readParam(req, "page");
    const pageMessage = "Page must be a positive integer";
    if (pageParam.invalid) {
      res.status(400).json({ success: false, message: pageMessage, code: "PAGE_INVALID" });
      return;
    }
    let page = DEFAULT_PAGE;
    if (pageParam.value !== undefined) {
      if (!/^\d+$/.test(pageParam.value)) {
        res.status(400).json({ success: false, message: pageMessage, code: "PAGE_INVALID" });
        return;
      }
      page = Number(pageParam.value);
      if (!Number.isSafeInteger(page) || page < 1) {
        res.status(400).json({ success: false, message: pageMessage, code: "PAGE_INVALID" });
        return;
      }
    }

    // ---- limit ----
    const limitParam = readParam(req, "limit");
    const limitMessage = `Limit must be an integer between 1 and ${MAX_LIMIT}`;
    if (limitParam.invalid) {
      res.status(400).json({ success: false, message: limitMessage, code: "LIMIT_INVALID" });
      return;
    }
    let limit = DEFAULT_LIMIT;
    if (limitParam.value !== undefined) {
      if (!/^\d+$/.test(limitParam.value)) {
        res.status(400).json({ success: false, message: limitMessage, code: "LIMIT_INVALID" });
        return;
      }
      limit = Number(limitParam.value);
      if (!Number.isSafeInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
        res.status(400).json({ success: false, message: limitMessage, code: "LIMIT_INVALID" });
        return;
      }
    }

    // ---- role ----
    const roleParam = readParam(req, "role");
    const roleChoices = "elder, youth, admin or none";
    if (roleParam.invalid) {
      res.status(400).json({
        success: false,
        message: `Role filter must be one of: ${roleChoices}.`, code: "ROLE_FILTER_INVALID",
      });
      return;
    }
    let role: RoleFilter | undefined;
    if (roleParam.value !== undefined) {
      if (!ROLE_FILTERS.includes(roleParam.value as RoleFilter)) {
        res.status(400).json({
          success: false,
          message: `Unknown role filter "${roleParam.value}". Choose ${roleChoices}.`, code: "ROLE_FILTER_INVALID",
        });
        return;
      }
      role = roleParam.value as RoleFilter;
    }

    // ---- status (account activity) ----
    const statusParam = readParam(req, "status");
    const statusChoices = "active or disabled";
    if (statusParam.invalid) {
      res.status(400).json({
        success: false,
        message: `Status filter must be one of: ${statusChoices}.`, code: "STATUS_FILTER_INVALID",
      });
      return;
    }
    let status: StatusFilter | undefined;
    if (statusParam.value !== undefined) {
      if (!STATUS_FILTERS.includes(statusParam.value as StatusFilter)) {
        res.status(400).json({
          success: false,
          message: `Unknown status filter "${statusParam.value}". Choose ${statusChoices}.`, code: "STATUS_FILTER_INVALID",
        });
        return;
      }
      status = statusParam.value as StatusFilter;
    }

    // ---- search ----
    const searchParam = readParam(req, "search");
    if (searchParam.invalid) {
      res.status(400).json({ success: false, message: "Search must be a string", code: "SEARCH_INVALID" });
      return;
    }
    let search: string | undefined;
    if (searchParam.value !== undefined) {
      if (searchParam.value.length > MAX_SEARCH_LENGTH) {
        res.status(400).json({
          success: false,
          message: `Search must be at most ${MAX_SEARCH_LENGTH} characters`, code: "SEARCH_TOO_LONG",
        });
        return;
      }
      search = searchParam.value;
    }

    const result = await listUsers({ page, limit, search, role, status });

    if (!result.success) {
      res.status(500).json({ success: false, message: result.message, code: result.code });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("List users controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}

/**
 * PUT /api/admin/users/:id/status - the only endpoint that may change an
 * account's active status. Authorisation is the route's
 * `authenticate` + `requireRole("admin")`.
 */
export async function setStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { active } = (req.body ?? {}) as { active?: unknown };

    // Strict boolean: "false", 0 and "true" are rejected instead of being
    // coerced, so a client bug can never disable an account by accident.
    if (typeof active !== "boolean") {
      res.status(400).json({
        success: false,
        message: "Active must be a boolean (true to enable, false to disable)",
        code: "USER_STATUS_INVALID",
      });
      return;
    }

    if (!req.userId) {
      res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided.", code: "AUTH_MISSING_TOKEN" });
      return;
    }

    const result = await setUserActiveStatus(id, active, req.userId);

    if (!result.success) {
      // NOT_FOUND covers both a malformed and an unknown id; the two
      // refusals are conflicts with the request target, so they are 409 and
      // the client can tell them apart by `code`.
      const status =
        result.code === "NOT_FOUND"
          ? 404
          : result.code === "ADMIN_SELF_DISABLE" ||
              result.code === "ADMIN_ACCOUNT_PROTECTED"
            ? 409
            : 400;
      res.status(status).json({ success: false, message: result.message, code: result.code });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Set user status controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}
