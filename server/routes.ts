import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { insertLeaderboardEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Rate limiting for leaderboard endpoints
  const leaderboardLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs for GET
    message: { message: "Too many requests, please try again later." },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  const leaderboardSubmitLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 submissions per minute
    message: { message: "Too many score submissions, please wait before submitting again." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Get leaderboard
  app.get("/api/leaderboard", leaderboardLimiter, async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Add leaderboard entry
  app.post("/api/leaderboard", leaderboardSubmitLimiter, async (req, res) => {
    try {
      const validatedData = insertLeaderboardEntrySchema.parse(req.body);
      const entry = await storage.addLeaderboardEntry(validatedData);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add leaderboard entry" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
