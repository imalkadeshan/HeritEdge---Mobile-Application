import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * API origin (HE-23).
 *
 * Set EXPO_PUBLIC_API_URL in a local `.env` file (never commit a real one -
 * it contains your machine's address, see .env.example). It must point at the
 * machine running the backend, e.g. a LAN address when the app runs on a
 * physical device, because `localhost` there means the phone itself.
 */
const DEFAULT_API_ORIGIN = "http://localhost:5000";
const configuredApiOrigin = (process.env.EXPO_PUBLIC_API_URL ?? "").trim();

/** No trailing slash, no trailing `/api` - the true server origin. */
export const API_ORIGIN = (configuredApiOrigin || DEFAULT_API_ORIGIN)
  .replace(/\/+$/, "")
  .replace(/\/api\/?$/i, "");

export const API_BASE_URL = `${API_ORIGIN}/api`;

/**
 * Turns the server-relative path stored in `imageUrl` (e.g.
 * "/uploads/content/ab12.png") into an absolute URL the <Image/> component
 * can load. Absolute/`data:`/`blob:` values are returned untouched.
 */
export function resolveImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(imageUrl)) return imageUrl;
  return `${API_ORIGIN}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

/**
 * Turns the server-relative path stored in `audioUrl` (e.g.
 * "/uploads/audio/ab12.m4a") into an absolute URL for the player. Same
 * rules as resolveImageUrl; kept separate so each field stays readable.
 */
export function resolveAudioUrl(audioUrl?: string | null): string | null {
  if (!audioUrl) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(audioUrl)) return audioUrl;
  return `${API_ORIGIN}${audioUrl.startsWith("/") ? "" : "/"}${audioUrl}`;
}

const TOKEN_KEY = "auth_token";

interface ApiResult<T = unknown> {
  success: boolean;
  message: string;
  /** Stable machine-readable code from the server (see i18n `api.<CODE>`). */
  code?: string;
  data?: T;
  token?: string;
}

// ---- Token management ----

export async function storeToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ---- Session invalidation (one place, every endpoint) ----

/** Server code for a disabled account, shared by login and every request. */
export const ACCOUNT_DISABLED_CODE = "ACCOUNT_DISABLED";

/**
 * Why the app is sitting on the login screen without the user having asked:
 * the server rejected the session itself, so the reason has to survive the
 * navigation that follows.
 */
const SESSION_NOTICE_KEY = "session_notice";

type SessionListener = (code: string) => void;

let sessionListener: SessionListener | null = null;
let accountDisabledHandled = false;

/**
 * Registers the single owner of "the session is no longer valid" work
 * (UserProvider clears the token, drops the user and lets AuthGuard route).
 */
export function onSessionInvalidated(listener: SessionListener | null): void {
  sessionListener = listener;
}

/** Called after a successful sign-in so a later disable can be handled. */
export function resetSessionInvalidation(): void {
  accountDisabledHandled = false;
}

export function storeSessionNotice(code: string): Promise<void> {
  return AsyncStorage.setItem(SESSION_NOTICE_KEY, code);
}

/** Reads the notice once and clears it, so it is never shown twice. */
export async function consumeSessionNotice(): Promise<string | null> {
  const notice = await AsyncStorage.getItem(SESSION_NOTICE_KEY);
  if (notice) await AsyncStorage.removeItem(SESSION_NOTICE_KEY);
  return notice;
}

/**
 * Fires at most once per session.
 *
 * A disabled account usually has several screens in flight at the same
 * moment, and every one of them comes back 401. Without this guard each
 * response would clear the session and navigate on its own, producing
 * competing redirects and repeated alerts.
 */
function notifySessionInvalidated(code: string): void {
  if (accountDisabledHandled) return;
  accountDisabledHandled = true;
  sessionListener?.(code);
}

// Every request this app makes passes through here exactly once. Watching the
// response here (instead of inside 60 endpoint wrappers) means a session the
// server invalidated is noticed no matter which screen asked, and endpoints
// added later inherit the behaviour for free. Ordinary permission failures
// are 403 with no code match, so they never trigger a sign-out.
//
// The signature is derived from the installed `fetch` rather than written out,
// because SDK 56 installs `expo/fetch` (which also accepts a `URL`) as the
// default `globalThis.fetch`; this wrapper stays valid either way.
type FetchArgs = Parameters<typeof fetch>;

const nativeFetch = globalThis.fetch;

if (
  nativeFetch &&
  !(nativeFetch as unknown as { __heritageSessionObserved?: boolean })
    .__heritageSessionObserved
) {
  const observedFetch = async (
    ...args: FetchArgs
  ): Promise<Awaited<ReturnType<typeof fetch>>> => {
    const response = await nativeFetch.apply(globalThis, args);

    if (response.status === 401) {
      // Read from a clone so the caller still receives the untouched body.
      response
        .clone()
        .json()
        .then((body: { code?: string } | null) => {
          if (body && body.code === ACCOUNT_DISABLED_CODE) {
            notifySessionInvalidated(ACCOUNT_DISABLED_CODE);
          }
        })
        .catch(() => {
          // A non-JSON 401 body is still a 401; nothing extra to do.
        });
    }

    return response;
  };

  (
    observedFetch as unknown as { __heritageSessionObserved?: boolean }
  ).__heritageSessionObserved = true;
  globalThis.fetch = observedFetch as unknown as typeof fetch;
}

// ---- Auth headers helper ----

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// ---- Register ----

export async function apiRegister(data: {
  name: string;
  email: string;
  password: string;
}): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Registration failed", code: result.code };
  }

  if (result.token) {
    await storeToken(result.token);
  }

  return { success: true, message: result.message, data: result.user, token: result.token };
}

// ---- Login ----

export async function apiLogin(data: {
  email: string;
  password: string;
}): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Login failed", code: result.code };
  }

  if (result.token) {
    await storeToken(result.token);
  }

  return { success: true, message: result.message, data: result.user, token: result.token };
}

// ---- Get current user ----

export async function apiGetMe(): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch user", code: result.code };
  }

  return { success: true, message: "OK", data: result.user };
}

// ---- Get All Cultural Content (Browse) ----

export async function apiGetAllContent(search?: string, category?: string): Promise<ApiResult> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category) params.append("category", category);
  const qs = params.toString();
  const url = qs ? `${API_BASE_URL}/content?${qs}` : `${API_BASE_URL}/content`;
  const response = await fetch(url, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch content", code: result.code };
  }

  return { success: true, message: result.message, data: result.content };
}

// ---- Get Content By ID ----

export async function apiGetContentById(
  contentId: string
): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/content/${contentId}`, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch content", code: result.code };
  }

  return { success: true, message: result.message, data: result.content };
}

// ---- Create Cultural Content ----

export async function apiCreateContent(data: {
  title: string;
  content: string;
  category: string;
}): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/content`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to create content", code: result.code };
  }

  return { success: true, message: result.message, data: result.content };
}

// ---- Get My Cultural Content ----

export async function apiGetMyContent(): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/content/mine`, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch content", code: result.code };
  }

  return { success: true, message: result.message, data: result.content };
}

// ---- Update Cultural Content ----

export async function apiUpdateContent(
  contentId: string,
  data: {
    title: string;
    content: string;
    category: string;
  }
): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/content/${contentId}`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to update content", code: result.code };
  }

  return { success: true, message: result.message, data: result.content };
}

// ---- Delete Cultural Content ----

export async function apiDeleteContent(
  contentId: string
): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/content/${contentId}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to delete content", code: result.code };
  }

  return { success: true, message: result.message };
}

// ---- Discover Elders (HE-40) ----

export async function apiDiscoverElders(filters?: {
  search?: string;
  interest?: string;
  language?: string;
}): Promise<ApiResult> {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.interest) params.append("interest", filters.interest);
  if (filters?.language) params.append("language", filters.language);
  const qs = params.toString();
  const url = qs
    ? `${API_BASE_URL}/elders?${qs}`
    : `${API_BASE_URL}/elders`;
  const response = await fetch(url, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch elders", code: result.code };
  }

  return { success: true, message: result.message, data: result.elders };
}

// ---- Get Elder by ID ----

export async function apiGetElderById(
  elderId: string
): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/elders/${elderId}`, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch elder", code: result.code };
  }

  return { success: true, message: result.message, data: result.elder };
}

// ---- Send Collaboration Request (HE-41) ----

export async function apiSendCollaborationRequest(data: {
  contentId: string;
  message: string;
}): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/collaborations`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to send request", code: result.code };
  }

  return { success: true, message: result.message, data: result.request };
}

// ---- Get Outgoing Requests (HE-41) ----

export async function apiGetOutgoingRequests(): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/collaborations/outgoing`, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch requests", code: result.code };
  }

  return { success: true, message: result.message, data: result.requests };
}

// ---- Get Incoming Requests (HE-42) ----

export async function apiGetIncomingRequests(): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/collaborations/incoming`, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch requests", code: result.code };
  }

  return { success: true, message: result.message, data: result.requests };
}

// ---- Get Collaboration Workspace (HE-43) ----

export async function apiGetCollaborationWorkspace(
  collaborationId: string
): Promise<ApiResult> {
  const response = await fetch(
    `${API_BASE_URL}/collaborations/${collaborationId}`,
    {
      method: "GET",
      headers: await authHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch workspace", code: result.code };
  }

  return { success: true, message: result.message, data: result.request };
}

// ---- Decide on Collaboration Request (HE-42) ----

export async function apiDecideOnRequest(
  requestId: string,
  decision: "accepted" | "rejected"
): Promise<ApiResult> {
  const response = await fetch(
    `${API_BASE_URL}/collaborations/${requestId}/decision`,
    {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify({ decision }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to process decision", code: result.code };
  }

  return { success: true, message: result.message, data: result.request };
}

// ---- Get Contributions by Collaboration (HE-28/HE-37) ----

export async function apiGetContributionsByCollaboration(
  collaborationRequestId: string
): Promise<ApiResult> {
  const response = await fetch(
    `${API_BASE_URL}/contributions/collaboration/${collaborationRequestId}`,
    {
      method: "GET",
      headers: await authHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch contributions", code: result.code };
  }

  return { success: true, message: result.message, data: result.contributions };
}

// ---- Create Contribution (HE-28/HE-37) ----

export async function apiCreateContribution(data: {
  collaborationRequestId: string;
  contentId: string;
  type: "translation" | "explanation" | "transcription" | "context";
  text: string;
  language?: string;
}): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/contributions`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to submit contribution", code: result.code };
  }

  return { success: true, message: result.message, data: result.contribution };
}

// ---- Update Contribution (HE-28/HE-37) ----

export async function apiUpdateContribution(
  contributionId: string,
  data: { text: string; language?: string }
): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/contributions/${contributionId}`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to update contribution", code: result.code };
  }

  return { success: true, message: result.message, data: result.contribution };
}

// ---- Review Contribution (HE-38/HE-39) ----

export async function apiReviewContribution(
  contributionId: string,
  decision: "approved" | "changes_requested",
  feedback?: string
): Promise<ApiResult> {
  const response = await fetch(
    `${API_BASE_URL}/contributions/${contributionId}/review`,
    {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify({ decision, feedback }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to review contribution", code: result.code };
  }

  return { success: true, message: result.message, data: result.contribution };
}

// ---- Get Contribution by ID (for notification navigation) ----

export async function apiGetContributionById(
  contributionId: string
): Promise<ApiResult> {
  const response = await fetch(
    `${API_BASE_URL}/contributions/${contributionId}`,
    {
      method: "GET",
      headers: await authHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch contribution", code: result.code };
  }

  return { success: true, message: result.message, data: result.contribution };
}

// ---- Get Approved Contributions by Content (HE-39) ----

export async function apiGetApprovedContributionsByContent(
  contentId: string
): Promise<ApiResult> {
  const response = await fetch(
    `${API_BASE_URL}/contributions/content/${contentId}/approved`,
    {
      method: "GET",
      headers: await authHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch approved contributions", code: result.code };
  }

  return { success: true, message: result.message, data: result.contributions };
}

// ---- Update profile (authenticated, /me) ----

export async function apiUpdateMe(data: {
  name?: string;
  bio?: string;
  language?: string;
  community?: string;
  culturalInterests?: string[];
}): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Update failed", code: result.code };
  }

  return { success: true, message: result.message, data: result.user };
}

// ---- Change password (authenticated, self only) ----
// PUT /users/me/password - identity comes from the token, never the body.
// On success the server stamps passwordChangedAt, which invalidates every
// previously issued session token; the caller must then clear the local
// session and sign in again with the new password.
export async function apiChangePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/users/me/password`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Password change failed", code: result.code };
  }

  return { success: true, message: result.message };
}

// ---- Update own profile by ID (authenticated, self only) ----
// The server only accepts profile fields here; `role`, `email`, `passwordHash`
// and any other privileged field are rejected server-side.

export async function apiUpdateProfile(
  userId: string,
  data: { name?: string; bio?: string; language?: string; community?: string; culturalInterests?: string[] }
): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Update failed", code: result.code };
  }

  return { success: true, message: result.message, data: result.user };
}

// ---- Choose Elder / Youth (the only public path that writes `role`) ----

export async function apiSetMyRole(
  role: "elder" | "youth"
): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/users/me/role`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify({ role }),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Role update failed", code: result.code };
  }

  return { success: true, message: result.message, data: result.user };
}

// ---- Notifications (HE-30/HE-32) ----

export async function apiGetNotifications(): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch notifications", code: result.code };
  }

  return { success: true, message: result.message, data: result.notifications };
}

export async function apiGetUnreadCount(): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch unread count", code: result.code };
  }

  return { success: true, message: result.message, data: result.count };
}

export async function apiMarkNotificationRead(
  notificationId: string
): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to mark notification as read", code: result.code };
  }

  return { success: true, message: result.message };
}

export async function apiMarkAllNotificationsRead(): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: "PUT",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to mark all as read", code: result.code };
  }

  return { success: true, message: result.message };
}

// ---- Admin session probe (admin foundation) ----

export async function apiAdminSession(): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/admin/session`, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Admin access denied", code: result.code };
  }

  return { success: true, message: result.message, data: { role: result.role } };
}

// ---- Admin dashboard ----

export interface AdminDashboardCounts {
  totalUsers: number;
  elders: number;
  youth: number;
  content: number;
}

export type AdminActivityType =
  | "user_registered"
  | "content_added"
  | "contribution_approved";

/**
 * Whitelisted recent-activity row from GET /api/admin/dashboard. Which
 * fields are present depends on `type` (name/role, title, or
 * contributor/content title) - never credentials or extra account details.
 */
export interface AdminActivity {
  id: string;
  type: AdminActivityType;
  /** ISO-8601 event timestamp. */
  at: string;
  name?: string;
  role?: string | null;
  title?: string;
  contributorName?: string;
  contentTitle?: string;
}

export interface AdminDashboardData {
  counts: AdminDashboardCounts;
  activities: AdminActivity[];
}

/** Admin-only dashboard: four MongoDB counts + the latest real events. */
export async function apiAdminGetDashboard(): Promise<
  ApiResult<AdminDashboardData>
> {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: result.message || "Failed to fetch the dashboard",
      code: result.code,
    };
  }

  return {
    success: true,
    message: result.message,
    data: { counts: result.counts, activities: result.activities },
  };
}

// ---- Content categories (HE-36) ----

/**
 * A category's `key` is the immutable value stored on every cultural item;
 * `label` is the editable display text shown to users.
 */
export interface Category {
  _id: string;
  key: string;
  label: string;
  active: boolean;
}

/** Active categories only — the source of truth for every category chooser. */
export async function apiGetCategories(): Promise<ApiResult<Category[]>> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch categories", code: result.code };
  }

  return { success: true, message: result.message, data: result.categories };
}

/** Admin-only: every category, including deactivated ones. */
export async function apiAdminGetCategories(): Promise<ApiResult<Category[]>> {
  const response = await fetch(`${API_BASE_URL}/admin/categories`, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to fetch categories", code: result.code };
  }

  return { success: true, message: result.message, data: result.categories };
}

export async function apiAdminCreateCategory(
  key: string,
  label: string
): Promise<ApiResult<Category>> {
  const response = await fetch(`${API_BASE_URL}/admin/categories`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ key, label }),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to create category", code: result.code };
  }

  return { success: true, message: result.message, data: result.category };
}

export async function apiAdminUpdateCategoryLabel(
  categoryId: string,
  label: string
): Promise<ApiResult<Category>> {
  const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify({ label }),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to update category", code: result.code };
  }

  return { success: true, message: result.message, data: result.category };
}

export async function apiAdminSetCategoryStatus(
  categoryId: string,
  active: boolean
): Promise<ApiResult<Category>> {
  const response = await fetch(
    `${API_BASE_URL}/admin/categories/${categoryId}/status`,
    {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify({ active }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to update category", code: result.code };
  }

  return { success: true, message: result.message, data: result.category };
}

/**
 * Admin-only: permanently removes one category.
 *
 * The server only allows this for a custom category that no cultural content
 * references, so `CATEGORY_IN_USE` (409) and `CATEGORY_DEFAULT` (409) are
 * expected answers rather than surprises - the caller shows them inline and
 * keeps the list.
 */
export async function apiAdminDeleteCategory(
  categoryId: string
): Promise<ApiResult<Category>> {
  const response = await fetch(
    `${API_BASE_URL}/admin/categories/${categoryId}`,
    {
      method: "DELETE",
      headers: await authHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to delete category", code: result.code };
  }

  return { success: true, message: result.message, data: result.category };
}

// ---- Registered users (HE-34) ----

/** The whitelist the admin list endpoint returns - nothing else. */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "elder" | "youth" | "admin" | null;
  /** false = the account cannot sign in or call the API (Active/Disabled). */
  active: boolean;
  registeredAt: string | null;
}

export interface AdminUsersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminUsersPage {
  users: AdminUser[];
  pagination: AdminUsersPagination;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  /** "elder" | "youth" | "admin" | "none" (accounts without a role). */
  role?: string;
  /** "active" | "disabled" - combined server-side with role and search. */
  status?: "active" | "disabled";
}

/** Admin-only paginated list of registered accounts (read only). */
export async function apiAdminGetUsers(
  query: AdminUsersQuery = {}
): Promise<ApiResult<AdminUsersPage>> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.append("page", String(query.page));
  if (query.limit !== undefined) params.append("limit", String(query.limit));
  if (query.search) params.append("search", query.search);
  if (query.role) params.append("role", query.role);
  if (query.status) params.append("status", query.status);
  const qs = params.toString();
  const url = qs
    ? `${API_BASE_URL}/admin/users?${qs}`
    : `${API_BASE_URL}/admin/users`;

  const response = await fetch(url, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: result.message || "Failed to fetch registered users",
      code: result.code,
    };
  }

  return {
    success: true,
    message: result.message,
    data: {
      users: Array.isArray(result.users) ? result.users : [],
      pagination: result.pagination,
    },
  };
}

/**
 * Admin-only: disables or re-enables one account.
 *
 * Disabling keeps the account's profile, cultural content and every
 * collaboration/contribution record; it only blocks sign-in and API access.
 * The server refuses to disable the acting admin or any admin account, and
 * returns the refused reason as a `code` so the UI can explain it inline.
 */
export async function apiAdminSetUserStatus(
  userId: string,
  active: boolean
): Promise<ApiResult<AdminUser>> {
  const response = await fetch(
    `${API_BASE_URL}/admin/users/${userId}/status`,
    {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify({ active }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: result.message || "Failed to update account status",
      code: result.code,
    };
  }

  return { success: true, message: result.message, data: result.user };
}

// ---- Cultural content management (HE-35) ----

/** Creator attribution attached to every admin view of an item. */
export interface AdminContentCreator {
  id: string;
  name: string;
  email: string;
  role: "elder" | "youth" | "admin" | null;
  /** Public photo path for the creator avatar (no other fields leak). */
  profileImage?: string | null;
}

/** The whitelist the admin endpoints return - nothing else. */
export interface AdminContentItem {
  id: string;
  title: string;
  content: string;
  /** Immutable category key stored on the item. */
  category: string;
  /** Current display label of that category. */
  categoryLabel: string;
  imageUrl: string | null;
  audioUrl: string | null;
  creator: AdminContentCreator;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminContentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminContentPage {
  content: AdminContentItem[];
  pagination: AdminContentPagination;
}

export interface AdminContentQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

/** Admin-only paginated list of every cultural item. */
export async function apiAdminGetContent(
  query: AdminContentQuery = {}
): Promise<ApiResult<AdminContentPage>> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.append("page", String(query.page));
  if (query.limit !== undefined) params.append("limit", String(query.limit));
  if (query.search) params.append("search", query.search);
  if (query.category) params.append("category", query.category);
  const qs = params.toString();
  const url = qs
    ? `${API_BASE_URL}/admin/content?${qs}`
    : `${API_BASE_URL}/admin/content`;

  const response = await fetch(url, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: result.message || "Failed to fetch cultural content",
      code: result.code,
    };
  }

  return {
    success: true,
    message: result.message,
    data: {
      content: Array.isArray(result.content) ? result.content : [],
      pagination: result.pagination,
    },
  };
}

export interface AdminContentStats {
  savedCount: number;
  collaborationRequestCount: number;
  contributionCount: number;
  approvedContributionCount: number;
}

export interface AdminApprovedContribution {
  id: string;
  submittedBy: { id: string; name: string };
  type: string;
  text: string;
  language: string;
  status: string;
  createdAt: string | null;
}

export interface AdminContentDetail {
  item: AdminContentItem;
  stats: AdminContentStats;
  approvedContributions: AdminApprovedContribution[];
}

/** Admin-only full view of one item: creator, media, counters, contributions. */
export async function apiAdminGetContentDetail(
  id: string
): Promise<ApiResult<AdminContentDetail>> {
  const response = await fetch(
    `${API_BASE_URL}/admin/content/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: await authHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: result.message || "Failed to fetch this item",
      code: result.code,
    };
  }

  return { success: true, message: result.message, data: result.detail };
}

/**
 * Admin-only edit. Only these three fields exist in the payload - createdBy,
 * imageUrl and audioUrl have no path into this request, so attribution and
 * media can never be rewritten from the app.
 */
export async function apiAdminUpdateContent(
  id: string,
  data: { title?: string; content?: string; category?: string }
): Promise<ApiResult> {
  const payload: { title?: string; content?: string; category?: string } = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.content !== undefined) payload.content = data.content;
  if (data.category !== undefined) payload.category = data.category;

  const response = await fetch(
    `${API_BASE_URL}/admin/content/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: result.message || "Failed to update this item",
      code: result.code,
    };
  }

  return { success: true, message: result.message };
}

/** What a delete removed alongside the item (server deletion policy). */
export interface ContentCleanupReport {
  savedRows: number;
  collaborationRequests: number;
  contributions: number;
  notifications: number;
  imageFile: "removed" | "absent" | "failed";
  audioFile: "removed" | "absent" | "failed";
  failures: string[];
}

/**
 * Admin-only delete. The returned report is exactly what the server removed:
 * saved items, collaboration requests, contributions, their notifications and
 * the stored media files - with any step that failed named in `failures`.
 */
export async function apiAdminDeleteContent(
  id: string
): Promise<ApiResult<ContentCleanupReport>> {
  const response = await fetch(
    `${API_BASE_URL}/admin/content/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: await authHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: result.message || "Failed to delete this item",
      code: result.code,
    };
  }

  return { success: true, message: result.message, data: result.cleanup };
}

// ---- Cultural item images (HE-23) ----

/**
 * A locally picked image. `uri` is a device-local path used only for the
 * preview and for the upload request - the value stored in MongoDB is always
 * the server-relative path returned by the upload endpoint.
 */
export interface PickedImage {
  uri: string;
  name: string;
  type: string;
  fileSize?: number;
  /** Browsers need a real File object instead of `{ uri }`. */
  webFile?: File | null;
}

/** Server-relative path stored on an item. */
export function contentImageUrlOf(content: unknown): string | null {
  const value = (content as { imageUrl?: string | null } | null)?.imageUrl;
  return typeof value === "string" && value ? value : null;
}

/**
 * Uploads an image for an item the signed-in user owns.
 *
 * XMLHttpRequest is used instead of fetch because it is the only API that
 * reports upload progress on both React Native and the web.
 */
export async function apiUploadContentImage(
  contentId: string,
  image: PickedImage,
  onProgress?: (fraction: number) => void
): Promise<ApiResult> {
  const token = await getToken();
  if (!token) {
    return { success: false, message: "You are signed out. Please log in again." };
  }

  return new Promise<ApiResult>((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.open(
      "POST",
      `${API_BASE_URL}/content/${encodeURIComponent(contentId)}/image`
    );
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.timeout = 120000;

    // Content-Type is deliberately not set: the multipart boundary must be
    // generated by the runtime.
    const form = new FormData();
    if (image.webFile) {
      form.append("image", image.webFile, image.name);
    } else {
      form.append("image", {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as unknown as Blob);
    }

    const uploadTarget = (
      xhr as unknown as {
        upload?: { onprogress?: ((event: ProgressEvent) => void) | null };
      }
    ).upload;

    if (onProgress && uploadTarget) {
      uploadTarget.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable && event.total > 0) {
          onProgress(Math.min(1, event.loaded / event.total));
        }
      };
    }

    const parse = (): Record<string, unknown> | null => {
      try {
        return JSON.parse(xhr.responseText || "{}");
      } catch {
        return null;
      }
    };

    xhr.onload = () => {
      const payload = parse();
      const message = (payload?.message as string) || "";

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          success: true,
          message: message || "Image uploaded successfully",
          data: payload?.content,
        });
        return;
      }

      resolve({
        success: false,
        message:
          message ||
          (xhr.status === 413
            ? "Image is too large. Maximum size is 5 MB."
            : "Image upload failed. Please try again."),
        code: payload?.code as string | undefined,
      });
    };

    xhr.onerror = () =>
      resolve({
        success: false,
        message: "Could not connect to the server. Please try again.",
      });
    xhr.ontimeout = () =>
      resolve({ success: false, message: "The upload timed out. Please try again." });
    xhr.onabort = () =>
      resolve({ success: false, message: "The upload was cancelled." });

    xhr.send(form);
  });
}

/** Removes the stored image of an item owned by the signed-in user. */
export async function apiRemoveContentImage(
  contentId: string
): Promise<ApiResult> {
  const response = await fetch(
    `${API_BASE_URL}/content/${encodeURIComponent(contentId)}/image`,
    {
      method: "DELETE",
      headers: await authHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to remove image", code: result.code };
  }

  return { success: true, message: result.message, data: result.content };
}

// ---- Profile photo (self only; the owner comes from the token) ----

/**
 * Uploads a profile photo for the signed-in account (field name "image").
 *
 * Same XMLHttpRequest approach as the content upload: it is the only API
 * that reports progress on both React Native and the web. On success
 * `data` carries the updated profileImage value.
 */
export async function apiUploadProfileImage(
  image: PickedImage,
  onProgress?: (fraction: number) => void
): Promise<ApiResult> {
  const token = await getToken();
  if (!token) {
    return { success: false, message: "You are signed out. Please log in again." };
  }

  return new Promise<ApiResult>((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${API_BASE_URL}/users/me/profile-image`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.timeout = 120000;

    // Content-Type is deliberately not set: the multipart boundary must be
    // generated by the runtime.
    const form = new FormData();
    if (image.webFile) {
      form.append("image", image.webFile, image.name);
    } else {
      form.append("image", {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as unknown as Blob);
    }

    const uploadTarget = (
      xhr as unknown as {
        upload?: { onprogress?: ((event: ProgressEvent) => void) | null };
      }
    ).upload;

    if (onProgress && uploadTarget) {
      uploadTarget.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable && event.total > 0) {
          onProgress(Math.min(1, event.loaded / event.total));
        }
      };
    }

    const parse = (): Record<string, unknown> | null => {
      try {
        return JSON.parse(xhr.responseText || "{}");
      } catch {
        return null;
      }
    };

    xhr.onload = () => {
      const payload = parse();
      const message = (payload?.message as string) || "";

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          success: true,
          message: message || "Profile photo updated",
          data: payload?.profileImage ?? null,
        });
        return;
      }

      resolve({
        success: false,
        message:
          message ||
          (xhr.status === 413
            ? "Image is too large. Maximum size is 5 MB."
            : "Photo upload failed. Please try again."),
        code: payload?.code as string | undefined,
      });
    };

    xhr.onerror = () =>
      resolve({
        success: false,
        message: "Could not connect to the server. Please try again.",
      });
    xhr.ontimeout = () =>
      resolve({ success: false, message: "The upload timed out. Please try again." });
    xhr.onabort = () =>
      resolve({ success: false, message: "The upload was cancelled." });

    xhr.send(form);
  });
}

/** Removes the signed-in account's profile photo (clears it back to initials). */
export async function apiRemoveProfileImage(): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/users/me/profile-image`, {
    method: "DELETE",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: result.message || "Failed to remove photo",
      code: result.code,
    };
  }

  return {
    success: true,
    message: result.message,
    data: result.profileImage ?? null,
  };
}

// ---- Audio (HE-26) ----

/**
 * A recording made with expo-audio. `uri` points at a temporary file on the
 * device (file://) or at a blob: URL in the browser. It is only used for the
 * preview and the upload request - the value stored in MongoDB is always the
 * server-relative path returned by the upload endpoint.
 */
export interface PickedAudio {
  uri: string;
  name: string;
  type: string;
  durationSeconds?: number;
}

/**
 * Uploads a recording for an item the signed-in user owns.
 *
 * Like the image upload this uses XMLHttpRequest, because it is the only API
 * that reports upload progress on both React Native and the web. Content-Type
 * is left to the runtime so the multipart boundary is generated correctly.
 */
export async function apiUploadContentAudio(
  contentId: string,
  audio: PickedAudio,
  onProgress?: (fraction: number) => void
): Promise<ApiResult> {
  const token = await getToken();
  if (!token) {
    return { success: false, message: "You are signed out. Please log in again." };
  }

  const form = new FormData();

  if (/^(blob|data):/i.test(audio.uri)) {
    // Browser recording: read the blob so it can be posted as a file part.
    try {
      const response = await fetch(audio.uri);
      const source = await response.blob();
      const type =
        source.type && source.type.toLowerCase().startsWith("audio/")
          ? source.type.split(";")[0]
          : audio.type;
      const blob = source.type === type ? source : new Blob([source], { type });
      form.append("audio", blob, audio.name);
    } catch {
      return {
        success: false,
        message: "Could not read the recording. Please record it again.",
      };
    }
  } else {
    // Device recording: React Native's FormData accepts a local file URI.
    form.append("audio", {
      uri: audio.uri,
      name: audio.name,
      type: audio.type,
    } as unknown as Blob);
  }

  return new Promise<ApiResult>((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.open(
      "POST",
      `${API_BASE_URL}/content/${encodeURIComponent(contentId)}/audio`
    );
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.timeout = 180000;

    const uploadTarget = (
      xhr as unknown as {
        upload?: { onprogress?: ((event: ProgressEvent) => void) | null };
      }
    ).upload;

    if (onProgress && uploadTarget) {
      uploadTarget.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable && event.total > 0) {
          onProgress(Math.min(1, event.loaded / event.total));
        }
      };
    }

    const parse = (): Record<string, unknown> | null => {
      try {
        return JSON.parse(xhr.responseText || "{}");
      } catch {
        return null;
      }
    };

    xhr.onload = () => {
      const payload = parse();
      const message = (payload?.message as string) || "";

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          success: true,
          message: message || "Audio uploaded successfully",
          data: payload?.content,
        });
        return;
      }

      resolve({
        success: false,
        message:
          message ||
          (xhr.status === 413
            ? "The recording is too large. Please record a shorter one."
            : "Audio upload failed. Please try again."),
        code: payload?.code as string | undefined,
      });
    };

    xhr.onerror = () =>
      resolve({
        success: false,
        message: "Could not connect to the server. Please try again.",
      });
    xhr.ontimeout = () =>
      resolve({ success: false, message: "The upload timed out. Please try again." });
    xhr.onabort = () =>
      resolve({ success: false, message: "The upload was cancelled." });

    xhr.send(form);
  });
}

/** Removes the stored recording of an item owned by the signed-in user. */
export async function apiRemoveContentAudio(
  contentId: string
): Promise<ApiResult> {
  const response = await fetch(
    `${API_BASE_URL}/content/${encodeURIComponent(contentId)}/audio`,
    {
      method: "DELETE",
      headers: await authHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to remove audio", code: result.code };
  }

  return { success: true, message: result.message, data: result.content };
}

// ---- Saved content (HE-33) ----

/** One entry of the signed-in user's saved list, with its content inlined. */
export interface SavedEntry {
  _id: string;
  contentId: string;
  savedAt: string;
  content: {
    _id: string;
    title: string;
    content: string;
    category: string;
    imageUrl: string | null;
    audioUrl: string | null;
    createdAt: string;
    updatedAt: string;
    creator: {
      id: string;
      name: string;
      /** Public photo path so saved-card avatars need no extra fetch. */
      profileImage?: string | null;
    };
  };
}

/** Saves an item to the signed-in user's list (idempotent). */
export async function apiSaveContent(
  contentId: string
): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/saved`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ contentId }),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to save content", code: result.code };
  }

  return { success: true, message: result.message, data: { saved: true } };
}

/** Removes an item from the signed-in user's list (safe to repeat). */
export async function apiUnsaveContent(
  contentId: string
): Promise<ApiResult> {
  const response = await fetch(
    `${API_BASE_URL}/saved/${encodeURIComponent(contentId)}`,
    {
      method: "DELETE",
      headers: await authHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: result.message || "Failed to remove from saved content",
      code: result.code,
    };
  }

  return { success: true, message: result.message, data: { saved: false } };
}

/** Reads whether the signed-in user has saved a given item. */
export async function apiIsContentSaved(
  contentId: string
): Promise<ApiResult<{ saved: boolean }>> {
  const response = await fetch(
    `${API_BASE_URL}/saved/${encodeURIComponent(contentId)}`,
    {
      method: "GET",
      headers: await authHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: result.message || "Failed to fetch saved state",
      code: result.code,
    };
  }

  return { success: true, message: result.message, data: result };
}

/** The signed-in user's saved list, newest first. */
export async function apiGetSavedContent(): Promise<ApiResult<SavedEntry[]>> {
  const response = await fetch(`${API_BASE_URL}/saved`, {
    method: "GET",
    headers: await authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: result.message || "Failed to fetch saved content",
      code: result.code,
    };
  }

  return { success: true, message: result.message, data: result.saved };
}
