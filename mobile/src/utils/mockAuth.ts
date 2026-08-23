/**
 * Mock Authentication — Temporary solution for UI testing
 *
 * DO NOT use in production. This will be replaced with real auth.
 */

import { User } from "../context/UserContext";

const MOCK_DELAY = 800;

let nextId = 3;

const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "elder@test.com",
    name: "Elder User",
    role: "elder",
    bio: "",
    language: "",
    community: "",
    culturalInterests: [],
    profileImage: null,
  },
  {
    id: "2",
    email: "youth@test.com",
    name: "Youth User",
    role: "youth",
    bio: "",
    language: "",
    community: "",
    culturalInterests: [],
    profileImage: null,
  },
];

// ---- Login ----

export async function mockLogin(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  const normalizedEmail = email.toLowerCase().trim();
  const user = MOCK_USERS.find((u) => u.email === normalizedEmail);

  if (!user) {
    return { success: false, error: "No account found with this email" };
  }

  if (password.length < 6) {
    return { success: false, error: "Incorrect password" };
  }

  return { success: true, user: { ...user } };
}

// ---- Registration ----

export async function mockRegister(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

  const normalizedEmail = data.email.toLowerCase().trim();
  const exists = MOCK_USERS.some((u) => u.email === normalizedEmail);

  if (exists) {
    return { success: false, error: "An account with this email already exists" };
  }

  const newUser: User = {
    id: String(nextId++),
    email: normalizedEmail,
    name: data.name.trim(),
    role: null,
    bio: "",
    language: "",
    community: "",
    culturalInterests: [],
    profileImage: null,
  };

  MOCK_USERS.push(newUser);

  return { success: true, user: { ...newUser } };
}

// ---- Validation ----

export function validateName(name: string): string | null {
  if (!name.trim()) {
    return "Full name is required";
  }

  if (name.trim().length < 2) {
    return "Name must be at least 2 characters";
  }

  return null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address";
  }

  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | null {
  if (!confirmPassword) {
    return "Please confirm your password";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  return null;
}
