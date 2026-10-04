import { Response } from "express";
import {
  listContent,
  getContentDetail,
  updateContentAsAdmin,
  deleteContentAsAdmin,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MAX_SEARCH_LENGTH,
} from "../services/adminContent.service";
import { AuthRequest } from "../middleware/auth.middleware";

// ---- HE-35: cultural-content management controller ----
//
// Authorisation is entirely in the route (authenticate + requireRole("admin"))
// on /api/admin/content: anonymous callers get 401, elders and youth 403.
// Everything below either reads or - for edit/delete - writes content through
// the shared content.service. Only title, content and category are ever read
// from a request body: createdBy, imageUrl, audioUrl, creator identity and
// every other privileged field have no path into any write here.

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

function errorStatus(message: string): number {
  if (message.includes("Not authorized")) return 403;
  if (message.includes("not found")) return 404;
  return 400;
}

/**
 * GET /api/admin/content - paginated, searchable list of every item.
 * Query: page (>=1), limit (1..50), search (title/content, literal),
 * category (must resolve, else 400 - HE-29 rule).
 */
export async function list(req: AuthRequest, res: Response): Promise<void> {
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

    // ---- category ----
    const categoryParam = readParam(req, "category");
    if (categoryParam.invalid) {
      res.status(400).json({ success: false, message: "Category must be a string", code: "CATEGORY_FILTER_INVALID" });
      return;
    }

    const result = await listContent({
      page,
      limit,
      search,
      category: categoryParam.value,
    });

    if (!result.success) {
      const status = result.invalidCategory ? 400 : 500;
      res.status(status).json({ success: false, message: result.message, code: result.code });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Admin list content controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}

/**
 * GET /api/admin/content/:id - full item for the management detail view:
 * creator, media, category label, related-data counts, approved
 * contributions. 404 for a malformed or unknown id.
 */
export async function detail(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const result = await getContentDetail(id);

    if (!result.success) {
      res.status(errorStatus(result.message)).json({
        success: false,
        message: result.message,
        code: result.code,
      });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Admin content detail controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}

/**
 * PUT /api/admin/content/:id - strict whitelist edit.
 * Only `title`, `content` and `category` are read; any other key in the body
 * is ignored, so createdBy / imageUrl / audioUrl can never be reassigned from
 * here. Each present field must be a plain string (400 otherwise) and at
 * least one field must be present.
 */
export async function edit(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const body: unknown = req.body;
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      res.status(400).json({
        success: false,
        message: "Request body must be an object", code: "REQUEST_BODY_INVALID",
      });
      return;
    }

    const source = body as Record<string, unknown>;

    const fields = ["title", "content", "category"] as const;
    for (const field of fields) {
      const value = source[field];
      if (value !== undefined && typeof value !== "string") {
        res.status(400).json({
          success: false,
          message: `${field.charAt(0).toUpperCase()}${field.slice(1)} must be a string`, code: "FIELD_TYPE_INVALID",
        });
        return;
      }
    }

    const patch: { title?: string; content?: string; category?: string } = {};
    if (source.title !== undefined) patch.title = source.title as string;
    if (source.content !== undefined) patch.content = source.content as string;
    if (source.category !== undefined) patch.category = source.category as string;

    if (Object.keys(patch).length === 0) {
      res.status(400).json({
        success: false,
        message: "Nothing to update. Provide title, content or category.", code: "CONTENT_UPDATE_EMPTY",
      });
      return;
    }

    const result = await updateContentAsAdmin({ contentId: id, ...patch });

    if (!result.success) {
      res.status(errorStatus(result.message)).json({
        success: false,
        message: result.message,
        code: result.code,
      });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Admin edit content controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}

/**
 * DELETE /api/admin/content/:id - delete an item under the shared cleanup
 * policy. The response includes the ContentCleanupReport (saved rows,
 * collaboration requests, contributions, notifications, image/audio files and
 * any failed steps) so the client can show what was actually removed.
 */
export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const result = await deleteContentAsAdmin(id);

    if (!result.success) {
      res.status(errorStatus(result.message)).json({
        success: false,
        message: result.message,
        code: result.code,
      });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Admin delete content controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
  }
}
