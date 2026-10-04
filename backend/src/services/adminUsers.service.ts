import { Types } from "mongoose";
import User from "../models/user.model";

// ---- Registered users list (HE-34) ----

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
/** Keeps one request from pulling an unbounded number of accounts. */
export const MAX_LIMIT = 50;
export const MAX_SEARCH_LENGTH = 100;

export const ROLE_FILTERS = ["elder", "youth", "admin", "none"] as const;
export type RoleFilter = (typeof ROLE_FILTERS)[number];

export const STATUS_FILTERS = ["active", "disabled"] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

/**
 * Accounts stored before `active` existed have no value for the field, and a
 * plain `active: true` query would silently hide every one of them. `$ne: false`
 * matches both an explicit `true` and a missing field, so only accounts that
 * were actually disabled ever drop out.
 */
function activeFilter(): Record<string, unknown> {
  return { active: { $ne: false } };
}

/**
 * The stored role can be null (an account that has not chosen yet), so the
 * filter exposes "none" for it - every other value maps straight onto the
 * stored enum.
 */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface ListUsersQuery {
  page: number;
  limit: number;
  search?: string;
  role?: RoleFilter;
  /** undefined = no status filter; otherwise backend-side filtering. */
  status?: StatusFilter;
}

/** The only shape that ever leaves this service - a deliberate whitelist. */
export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: "elder" | "youth" | "admin" | null;
  /** Account status; a missing stored value reads as active. */
  active: boolean;
  registeredAt: Date | null;
}

export interface UsersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ListUsersResult {
  success: boolean;
  message: string;
  code?: string;
  users?: AdminUserItem[];
  pagination?: UsersPagination;
}

export async function listUsers(
  query: ListUsersQuery
): Promise<ListUsersResult> {
  const { page, limit, search, role, status } = query;

  try {
    const filter: Record<string, unknown> = {};

    if (role === "none") {
      // Matches both an explicit null and a missing field.
      filter.role = null;
    } else if (role) {
      filter.role = role;
    }

    // Combined with the search term and the role filter above, so the
    // pagination totals below are the totals of the filtered set.
    if (status === "active") {
      Object.assign(filter, activeFilter());
    } else if (status === "disabled") {
      filter.active = false;
    }

    if (search) {
      // Literal text: the term is escaped, so "a.b" only ever matches a
      // literal dot instead of any character.
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const skip = (page - 1) * limit;

    const [total, docs] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        // Projection is the second half of the whitelist: only these columns
        // are read, so passwordHash (and every profile field) cannot reach
        // the response even by accident.
        .select("name email role active createdAt")
        // createdAt then _id: identical timestamps still break deterministically,
        // which is what keeps page boundaries duplicate-free.
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const users: AdminUserItem[] = docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      role: doc.role ?? null,
      active: doc.active ?? true,
      registeredAt: doc.createdAt ?? null,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Users fetched successfully",
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("List users error:", error);
    return {
      success: false,
      message: "Failed to fetch users. Please try again.",
      code: "SERVER_ERROR",
    };
  }
}

// ---- Account status (disable / enable) ----

export interface SetUserStatusResult {
  success: boolean;
  message: string;
  code?: string;
  /** The account after the change, whitelisted exactly like the list. */
  user?: AdminUserItem;
}

/**
 * Disables or re-enables one account.
 *
 * Deliberately narrow, because this is the only endpoint that may write
 * `active`:
 *
 * - Nothing is ever deleted. The profile, the cultural content and every
 *   collaboration/contribution record stay exactly as they are; only access
 *   to the API is blocked, and re-enabling restores it immediately.
 * - Role is untouched, so an elder/youth/roleless account keeps whatever role
 *   it had.
 * - An admin can never lock themselves out (self-disable is refused) and no
 *   admin account can be disabled at all, so the area can never end up with
 *   nobody able to undo a mistake.
 * - Repeating the status the account already has is a no-op: no write, no
 *   `updatedAt` bump, no notification, no other side effect.
 */
export async function setUserActiveStatus(
  userId: string,
  active: boolean,
  actingAdminId: string
): Promise<SetUserStatusResult> {
  const notFound: SetUserStatusResult = {
    success: false,
    message: "User not found",
    code: "NOT_FOUND",
  };

  // A malformed id is "no such account", never a 500.
  if (!userId || !Types.ObjectId.isValid(userId)) {
    return notFound;
  }

  const user = await User.findById(userId);

  if (!user) {
    return notFound;
  }

  if (!active) {
    if (user._id.toString() === actingAdminId) {
      return {
        success: false,
        message: "You cannot disable your own admin account",
        code: "ADMIN_SELF_DISABLE",
      };
    }

    if (user.role === "admin") {
      return {
        success: false,
        message: "Admin accounts cannot be disabled",
        code: "ADMIN_ACCOUNT_PROTECTED",
      };
    }
  }

  // Same value as stored: report success without touching the document, so
  // a repeated tap cannot produce extra writes or notifications.
  const alreadyInState = (user.active ?? true) === active;
  if (!alreadyInState) {
    user.active = active;
    try {
      await user.save();
    } catch (error) {
      console.error("Update user status error:", error);
      return {
        success: false,
        message: "Failed to update account. Please try again.",
        code: "SERVER_ERROR",
      };
    }
  }

  const updated = alreadyInState ? user : await User.findById(userId);

  if (!updated) {
    return notFound;
  }

  return {
    success: true,
    message: active
      ? "Account enabled successfully"
      : "Account disabled successfully",
    user: {
      id: updated._id.toString(),
      name: updated.name,
      email: updated.email,
      role: updated.role ?? null,
      active: updated.active ?? true,
      registeredAt: updated.createdAt ?? null,
    },
  };
}
