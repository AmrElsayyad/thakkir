import { Client, createClient } from "@libsql/client";

// Environment variables for Turso configuration
const TURSO_URL = process.env.NEXT_PUBLIC_TURSO_URL;
const TURSO_AUTH_TOKEN = process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN;

// Create the main database client
export const createTursoClient = (userId?: string): Client => {
  // For development, use a local SQLite file
  if (process.env.NODE_ENV === "development" && !TURSO_URL) {
    return createClient({
      url: `file:${userId ? `dhikr-${userId}` : "dhikr"}.db`,
    });
  }

  // For production with Turso cloud
  if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
    throw new Error(
      "Missing Turso configuration. Please set NEXT_PUBLIC_TURSO_URL and NEXT_PUBLIC_TURSO_AUTH_TOKEN"
    );
  }

  return createClient({
    url: `file:${userId ? `dhikr-${userId}` : "dhikr"}.db`, // Local SQLite file
    syncUrl: TURSO_URL, // Turso cloud URL
    authToken: TURSO_AUTH_TOKEN,
  });
};

// Default client for general use
export const tursoClient = createTursoClient();

// Initialize database schema
export const initializeDatabase = async (client: Client) => {
  try {
    // Create tables if they don't exist
    await client.batch([
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Dhikr templates/library
      `CREATE TABLE IF NOT EXISTS dhikr_templates (
        id TEXT PRIMARY KEY,
        arabic_text TEXT NOT NULL,
        transliteration TEXT,
        translation TEXT NOT NULL,
        category TEXT,
        reference TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // User's dhikr sessions
      `CREATE TABLE IF NOT EXISTS dhikr_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        dhikr_template_id TEXT REFERENCES dhikr_templates(id),
        count INTEGER NOT NULL DEFAULT 0,
        target_count INTEGER,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        is_completed BOOLEAN DEFAULT FALSE
      )`,

      // Individual dhikr counts (for detailed tracking)
      `CREATE TABLE IF NOT EXISTS dhikr_counts (
        id TEXT PRIMARY KEY,
        session_id TEXT REFERENCES dhikr_sessions(id),
        count_method TEXT CHECK(count_method IN ('tap', 'voice', 'auto')),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // User goals and settings
      `CREATE TABLE IF NOT EXISTS user_goals (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        dhikr_template_id TEXT REFERENCES dhikr_templates(id),
        daily_target INTEGER,
        weekly_target INTEGER,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Reminder settings
      `CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        title TEXT NOT NULL,
        time TEXT NOT NULL,
        days_of_week TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
    ]);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
};

// Sync data when online
export const syncDatabase = async (client: Client) => {
  try {
    if (client.sync) {
      await client.sync();
      console.log("Database synced successfully");
    }
  } catch (error) {
    console.warn("Failed to sync database:", error);
    // Don't throw - app should continue working offline
  }
};
