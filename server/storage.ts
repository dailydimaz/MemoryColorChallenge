import { users, leaderboardEntries, type User, type InsertUser, type LeaderboardEntry, type InsertLeaderboardEntry } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  addLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leaderboardEntries: Map<number, LeaderboardEntry>;
  private currentUserId: number;
  private currentLeaderboardId: number;

  constructor() {
    this.users = new Map();
    this.leaderboardEntries = new Map();
    this.currentUserId = 1;
    this.currentLeaderboardId = 1;
    
    // Initialize with some sample leaderboard data
    this.initializeLeaderboard();
  }

  private initializeLeaderboard() {
    const sampleEntries: LeaderboardEntry[] = [
      { id: 1, playerName: "ProGamer", score: 2450, level: 15, timeCompleted: 120 },
      { id: 2, playerName: "MemoryMaster", score: 1890, level: 12, timeCompleted: 145 },
      { id: 3, playerName: "FastFingers", score: 1560, level: 10, timeCompleted: 98 },
      { id: 4, playerName: "PatternPro", score: 1340, level: 9, timeCompleted: 156 },
      { id: 5, playerName: "ColorKing", score: 1120, level: 8, timeCompleted: 189 },
    ];

    sampleEntries.forEach(entry => {
      this.leaderboardEntries.set(entry.id, entry);
    });
    this.currentLeaderboardId = 6;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return Array.from(this.leaderboardEntries.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  async addLeaderboardEntry(insertEntry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    const id = this.currentLeaderboardId++;
    const entry: LeaderboardEntry = { ...insertEntry, id };
    this.leaderboardEntries.set(id, entry);
    return entry;
  }
}

export const storage = new MemStorage();
