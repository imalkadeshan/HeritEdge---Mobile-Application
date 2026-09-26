import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import contentRoutes from "./routes/content.routes";
import elderRoutes from "./routes/elder.routes";
import collaborationRoutes from "./routes/collaboration.routes";
import contributionRoutes from "./routes/contribution.routes";
import notificationRoutes from "./routes/notification.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/elders", elderRoutes);
app.use("/api/collaborations", collaborationRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/notifications", notificationRoutes);

export default app;
