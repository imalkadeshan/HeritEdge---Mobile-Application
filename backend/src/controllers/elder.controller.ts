import { Response } from "express";
import { discoverElders, getElderById } from "../services/elder.service";
import { AuthRequest } from "../middleware/auth.middleware";

export async function discover(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const interest =
      typeof req.query.interest === "string" ? req.query.interest : undefined;
    const language =
      typeof req.query.language === "string" ? req.query.language : undefined;

    const result = await discoverElders(interest, language);

    if (!result.success) {
      res.status(500).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Discover elders controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}

export async function getById(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const id = req.params.id as string;
    const result = await getElderById(id);

    if (!result.success) {
      const status = result.message.includes("not found") ? 404 : 500;
      res.status(status).json({ success: false, message: result.message });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Get elder by id controller error:", error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
}
