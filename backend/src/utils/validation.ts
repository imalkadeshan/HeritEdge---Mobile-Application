export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email || !email.trim()) {
    return { valid: false, error: "Email is required" };
  }

  const normalized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalized)) {
    return { valid: false, error: "Please enter a valid email address" };
  }

  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }

  return { valid: true };
}

export function validateName(name: string): ValidationResult {
  if (!name || !name.trim()) {
    return { valid: false, error: "Name is required" };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: "Name must be at least 2 characters" };
  }

  return { valid: true };
}

export function validateRole(role: string): ValidationResult {
  if (!role) {
    return { valid: false, error: "Role is required" };
  }

  if (role !== "elder" && role !== "youth") {
    return { valid: false, error: "Role must be either elder or youth" };
  }

  return { valid: true };
}
