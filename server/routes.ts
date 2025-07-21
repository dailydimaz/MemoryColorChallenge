import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeaderboardEntrySchema } from "@shared/schema";
import { z } from "zod";

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function createRateLimiter(maxRequests: number, windowMs: number, message: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `${ip}-${req.path}`;
    
    let entry = requestCounts.get(key);
    
    if (!entry || now > entry.resetTime) {
      entry = { count: 1, resetTime: now + windowMs };
      requestCounts.set(key, entry);
      return next();
    }
    
    if (entry.count >= maxRequests) {
      return res.status(429).json({ message });
    }
    
    entry.count++;
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Rate limiting for leaderboard endpoints
  const leaderboardLimiter = createRateLimiter(
    100, // max requests
    15 * 60 * 1000, // 15 minutes
    "Too many requests, please try again later."
  );

  const leaderboardSubmitLimiter = createRateLimiter(
    5, // max requests
    60 * 1000, // 1 minute
    "Too many score submissions, please wait before submitting again."
  );

  // Get leaderboard
  app.get("/api/leaderboard", leaderboardLimiter, async (_req, res) => {
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
