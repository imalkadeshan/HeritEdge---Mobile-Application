import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://localhost:5000/api";
const TOKEN_KEY = "auth_token";

interface ApiResult<T = unknown> {
  success: boolean;
  message: string;
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
    return { success: false, message: result.message || "Registration failed" };
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
    return { success: false, message: result.message || "Login failed" };
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
    return { success: false, message: result.message || "Failed to fetch user" };
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
    return { success: false, message: result.message || "Failed to fetch content" };
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
    return { success: false, message: result.message || "Failed to fetch content" };
  }

  return { success: true, message: result.message, data: result.content };
}

// ---- Create Cultural Content ----

export async function apiCreateContent(data: {
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
}): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/content`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to create content" };
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
    return { success: false, message: result.message || "Failed to fetch content" };
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
    imageUrl?: string;
  }
): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/content/${contentId}`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Failed to update content" };
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
    return { success: false, message: result.message || "Failed to delete content" };
  }

  return { success: true, message: result.message };
}

// ---- Discover Elders (HE-40) ----

export async function apiDiscoverElders(
  interest?: string,
  language?: string
): Promise<ApiResult> {
  const params = new URLSearchParams();
  if (interest) params.append("interest", interest);
  if (language) params.append("language", language);
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
    return { success: false, message: result.message || "Failed to fetch elders" };
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
    return { success: false, message: result.message || "Failed to fetch elder" };
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
    return { success: false, message: result.message || "Failed to send request" };
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
    return { success: false, message: result.message || "Failed to fetch requests" };
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
    return { success: false, message: result.message || "Failed to fetch requests" };
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
    return { success: false, message: result.message || "Failed to fetch workspace" };
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
    return { success: false, message: result.message || "Failed to process decision" };
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
    return { success: false, message: result.message || "Failed to fetch contributions" };
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
    return { success: false, message: result.message || "Failed to submit contribution" };
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
    return { success: false, message: result.message || "Failed to update contribution" };
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
    return { success: false, message: result.message || "Failed to review contribution" };
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
    return { success: false, message: result.message || "Failed to fetch contribution" };
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
    return { success: false, message: result.message || "Failed to fetch approved contributions" };
  }

  return { success: true, message: result.message, data: result.contributions };
}

// ---- Update profile (authenticated, /me) ----

export async function apiUpdateMe(data: {
  name?: string;
  bio?: string;
  language?: string;
  community?: string;
  profileImage?: string;
  culturalInterests?: string[];
}): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Update failed" };
  }

  return { success: true, message: result.message, data: result.user };
}

// ---- Update user by ID (used during registration before JWT) ----

export async function apiUpdateProfile(
  userId: string,
  data: { role?: string; name?: string; bio?: string; language?: string; community?: string; culturalInterests?: string[] }
): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    return { success: false, message: result.message || "Update failed" };
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
    return { success: false, message: result.message || "Failed to fetch notifications" };
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
    return { success: false, message: result.message || "Failed to fetch unread count" };
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
    return { success: false, message: result.message || "Failed to mark notification as read" };
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
    return { success: false, message: result.message || "Failed to mark all as read" };
  }

  return { success: true, message: result.message };
}
