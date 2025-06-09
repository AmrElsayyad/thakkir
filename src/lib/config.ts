export interface AppConfig {
  database: {
    type: "turso" | "sqlite" | "demo";
    tursoUrl?: string;
    tursoToken?: string;
    sqlitePath?: string;
  };
  voice: {
    language: string;
    continuousListening: boolean;
    confidenceThreshold: number;
  };
  app: {
    name: string;
    version: string;
  };
}

export const getAppConfig = (): AppConfig => {
  // Check environment variables first
  const tursoUrl =
    process.env.TURSO_DATABASE_URL ||
    process.env.NEXT_PUBLIC_TURSO_DATABASE_URL;
  const tursoToken =
    process.env.TURSO_AUTH_TOKEN || process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN;
  const databaseType =
    process.env.DATABASE_TYPE || process.env.NEXT_PUBLIC_DATABASE_TYPE;

  // Determine database configuration
  let database: AppConfig["database"];

  if (tursoUrl && tursoToken) {
    database = {
      type: "turso",
      tursoUrl,
      tursoToken,
    };
  } else if (databaseType === "sqlite" || (!tursoUrl && !databaseType)) {
    // Default to SQLite if no cloud config and not explicitly set to demo
    database = {
      type: "sqlite",
      sqlitePath: process.env.DATABASE_PATH || "./data/thakkir.db",
    };
  } else {
    // Demo mode - no persistence
    database = {
      type: "demo",
    };
  }

  return {
    database,
    voice: {
      language:
        process.env.VOICE_RECOGNITION_LANGUAGE ||
        process.env.NEXT_PUBLIC_VOICE_RECOGNITION_LANGUAGE ||
        "ar-SA",
      continuousListening:
        (process.env.VOICE_CONTINUOUS_LISTENING ||
          process.env.NEXT_PUBLIC_VOICE_CONTINUOUS_LISTENING ||
          "true") === "true",
      confidenceThreshold: parseFloat(
        process.env.VOICE_CONFIDENCE_THRESHOLD ||
          process.env.NEXT_PUBLIC_VOICE_CONFIDENCE_THRESHOLD ||
          "0.7"
      ),
    },
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME || "Thakkir",
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    },
  };
};

export const config = getAppConfig();
