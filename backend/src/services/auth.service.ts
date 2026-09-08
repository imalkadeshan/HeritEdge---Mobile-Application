import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

// ---- Register ----

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: "elder" | "youth";
}

interface RegisterResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    bio: string;
    language: string;
    community: string;
    culturalInterests: string[];
    profileImage: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export async function registerUser(data: RegisterData): Promise<RegisterResult> {
  const { name, email, password, role } = data;

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return { success: false, message: "An account with this email already exists" };
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: role || null,
  });

  return {
    success: true,
    message: "Registration successful",
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      language: user.language,
      community: user.community,
      culturalInterests: user.culturalInterests,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

// ---- Login ----

interface LoginData {
  email: string;
  password: string;
}

interface LoginResult {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    bio: string;
    language: string;
    community: string;
    culturalInterests: string[];
    profileImage: string | null;
  };
}

export async function loginUser(data: LoginData): Promise<LoginResult> {
  const { email, password } = data;

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
  if (!user) {
    return { success: false, message: "No account found with this email" };
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return { success: false, message: "Incorrect password" };
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return { success: false, message: "Server configuration error" };
  }

  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    secret,
    { expiresIn: "7d" }
  );

  return {
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      language: user.language,
      community: user.community,
      culturalInterests: user.culturalInterests,
      profileImage: user.profileImage,
    },
  };
}
