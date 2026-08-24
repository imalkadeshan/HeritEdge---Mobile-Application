import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import {
  validateName,
  validateEmail,
  validatePassword,
} from "../utils/validation";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    const nameResult = validateName(name);
    if (!nameResult.valid) {
      res.status(400).json({ success: false, message: nameResult.error });
      return;
    }

    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      res.status(400).json({ success: false, message: emailResult.error });
      return;
    }

    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) {
      res.status(400).json({ success: false, message: passwordResult.error });
      return;
    }

    const result = await registerUser({ name, email, password });

    if (!result.success) {
      res.status(409).json({ success: false, message: result.message });
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      res.status(400).json({ success: false, message: emailResult.error });
      return;
    }

    if (!password) {
      res.status(400).json({ success: false, message: "Password is required" });
      return;
    }

    const result = await loginUser({ email, password });

    if (!result.success) {
      res.status(401).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
}