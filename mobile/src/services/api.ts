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

  return { success: true, message: result.message, data: result.user };
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
