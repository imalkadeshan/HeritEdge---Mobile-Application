import { Router, Request, Response } from "express";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "HeritEdge API is running",
  });
});

export default router;
