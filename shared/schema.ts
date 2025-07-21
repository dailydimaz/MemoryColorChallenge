import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  playerName: text("player_name").notNull(),
  score: integer("score").notNull(),
  level: integer("level").notNull(),
  timeCompleted: integer("time_completed").notNull(), // in seconds
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).pick({
  playerName: true,
  score: true,
  level: true,
  timeCompleted: true,
}).extend({
  playerName: z.string()
    .min(1, "Player name is required")
    .max(20, "Player name must be 20 characters or less")
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, "Player name contains invalid characters")
    .transform((str: string) => str.trim()),
  score: z.number().int().min(0).max(1000000),
  level: z.number().int().min(1).max(50),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
