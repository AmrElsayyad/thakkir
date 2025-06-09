"use client";

import { useEffect, useState } from 'react';

import { config } from '@/lib/config';
import { sqliteService } from '@/lib/db/sqlite-service';
import { useDhikrStore } from '@/stores/dhikr-store';

import type { DhikrTemplate, DhikrSession } from "@/types/dhikr";

// Default dhikr templates (always available)
const DEFAULT_TEMPLATES: DhikrTemplate[] = [
  {
    id: "subhanallah",
    arabic_text: "سُبْحَانَ اللَّهِ",
    transliteration: "SubhanAllah",
    translation: "Glory be to Allah",
    category: "tasbih",
    reference: "Common dhikr",
    created_at: new Date().toISOString(),
  },
  {
    id: "alhamdulillah",
    arabic_text: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    translation: "All praise is due to Allah",
    category: "tahmid",
    reference: "Common dhikr",
    created_at: new Date().toISOString(),
  },
  {
    id: "allahu-akbar",
    arabic_text: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest",
    category: "takbir",
    reference: "Common dhikr",
    created_at: new Date().toISOString(),
  },
  {
    id: "la-ilaha-illa-allah",
    arabic_text: "لَا إِلَهَ إِلَّا اللَّهُ",
    transliteration: "La ilaha illa Allah",
    translation: "There is no god but Allah",
    category: "tahlil",
    reference: "Common dhikr",
    created_at: new Date().toISOString(),
  },
  {
    id: "astaghfirullah",
    arabic_text: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    translation: "I seek forgiveness from Allah",
    category: "istighfar",
    reference: "Common dhikr",
    created_at: new Date().toISOString(),
  },
];

export const useDhikrDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPersistenceAvailable, setIsPersistenceAvailable] = useState(false);
  const [databaseType, setDatabaseType] = useState<"turso" | "sqlite" | "demo">(
    "demo"
  );

  const store = useDhikrStore();

  // Initialize database based on configuration
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("Initializing database with config:", config.database);

        if (
          config.database.type === "turso" &&
          config.database.tursoUrl &&
          config.database.tursoToken
        ) {
          // Try Turso (cloud SQLite)
          try {
            console.log("Attempting Turso connection...");
            // TODO: Implement Turso connection if needed
            // For now, fallback to SQLite since Turso had browser issues
            throw new Error("Turso not implemented in browser environment");
          } catch (tursoError) {
            console.warn(
              "Turso connection failed, falling back to SQLite:",
              tursoError
            );
            // Fallback to SQLite
            await initializeSQLite();
          }
        } else if (config.database.type === "sqlite") {
          // Use local SQLite (IndexedDB)
          await initializeSQLite();
        } else {
          // Demo mode - memory only
          await initializeDemoMode();
        }

        setIsInitialized(true);
        setError(null);

        console.log("Database initialized successfully", {
          type: databaseType,
          persistence: isPersistenceAvailable ? "enabled" : "demo mode",
        });
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError("Failed to initialize database");
        // Fallback to demo mode
        await initializeDemoMode();
        setIsInitialized(true);
      }
    };

    const initializeSQLite = async () => {
      try {
        console.log("Initializing SQLite (IndexedDB)...");
        await sqliteService.initialize();

        // Load existing templates or create defaults
        const existingTemplates = await sqliteService.getDhikrTemplates();
        if (existingTemplates.length === 0) {
          // Create default templates in database
          for (const template of DEFAULT_TEMPLATES) {
            await sqliteService.createDhikrTemplate(template);
          }
          store.loadTemplates(DEFAULT_TEMPLATES);
        } else {
          store.loadTemplates(existingTemplates);
        }

        // Load recent sessions
        const recentSessions = await sqliteService.getDhikrSessions({
          limit: 50,
        });
        store.loadSessions(recentSessions);

        setDatabaseType("sqlite");
        setIsPersistenceAvailable(true);
        console.log("SQLite initialized successfully");
      } catch (err) {
        console.error("SQLite initialization failed:", err);
        throw err;
      }
    };

    const initializeDemoMode = async () => {
      console.log("Running in demo mode - no persistence");
      store.loadTemplates(DEFAULT_TEMPLATES);
      setDatabaseType("demo");
      setIsPersistenceAvailable(false);
    };

    initialize();
  }, []); // Empty dependency array - only run once on mount

  // Create new dhikr session
  const startDhikrSession = async (
    templateId: string,
    targetCount?: number
  ) => {
    try {
      const sessionData = {
        user_id: "default-user",
        dhikr_template_id: templateId,
        count: 0,
        target_count: targetCount,
        started_at: new Date().toISOString(),
        is_completed: false,
      };

      let sessionToUse;

      if (isPersistenceAvailable && databaseType === "sqlite") {
        // Persist to SQLite first, then update store with the actual session
        const savedSession = await sqliteService.createDhikrSession(
          sessionData
        );
        console.log("Session saved to SQLite:", savedSession);
        sessionToUse = savedSession;

        // Update the store with the actual saved session ID
        store.startNewSession(templateId, targetCount);
        // Update the current session in store to match the SQLite session
        store.updateCurrentSessionId(savedSession.id);
      } else {
        // Demo mode - start session in store first
        store.startNewSession(templateId, targetCount);
        sessionToUse = {
          id: store.currentSession?.id || `local-${Date.now()}`,
          ...sessionData,
        };
      }

      return sessionToUse;
    } catch (err) {
      console.error("Failed to start dhikr session:", err);
      // Still try to start session in store for demo mode
      store.startNewSession(templateId, targetCount);
      return null;
    }
  };

  // Increment dhikr count
  const incrementDhikrCount = async (
    method: "tap" | "voice" | "auto" = "voice"
  ) => {
    if (!store.currentSession) return false;

    try {
      // Increment in local store for immediate UI response
      store.incrementCounter();

      if (
        isPersistenceAvailable &&
        databaseType === "sqlite" &&
        store.currentSession.id
      ) {
        try {
          // Check if session exists before updating
          const sessionExists = await sqliteService.sessionExists(
            store.currentSession.id
          );

          if (sessionExists) {
            // Update in SQLite
            await sqliteService.updateDhikrSession(store.currentSession.id, {
              count: store.counter.currentCount,
            });
            console.log(
              `Count incremented via ${method}:`,
              store.counter.currentCount
            );
          } else {
            console.warn(
              `Session ${store.currentSession.id} not found in SQLite, skipping update`
            );
          }
        } catch (sqliteError) {
          console.warn(
            "SQLite update failed, continuing with in-memory counting:",
            sqliteError
          );
        }
      }

      // Check if session is completed
      if (
        store.counter.targetCount &&
        store.counter.currentCount >= store.counter.targetCount
      ) {
        await completeCurrentSession();
      }

      return true;
    } catch (err) {
      console.error("Failed to increment dhikr count:", err);
      return false;
    }
  };

  // Complete current session
  const completeCurrentSession = async () => {
    if (!store.currentSession) return false;

    try {
      const completedAt = new Date().toISOString();

      if (
        isPersistenceAvailable &&
        databaseType === "sqlite" &&
        store.currentSession.id
      ) {
        try {
          // Check if session exists before updating
          const sessionExists = await sqliteService.sessionExists(
            store.currentSession.id
          );

          if (sessionExists) {
            // Update in SQLite
            await sqliteService.updateDhikrSession(store.currentSession.id, {
              is_completed: true,
              completed_at: completedAt,
              count: store.counter.currentCount,
            });
            console.log("Session completed and saved to SQLite");
          } else {
            console.warn(
              `Session ${store.currentSession.id} not found in SQLite, completing in memory only`
            );
          }
        } catch (sqliteError) {
          console.warn(
            "SQLite completion update failed, completing in memory only:",
            sqliteError
          );
        }
      }

      // Complete in local store
      store.completeSession();

      return true;
    } catch (err) {
      console.error("Failed to complete session:", err);
      return false;
    }
  };

  // Get today's progress
  const getTodayProgress = async () => {
    if (!isPersistenceAvailable || databaseType !== "sqlite") {
      // Return current session data for demo mode
      const currentCount = store.counter.currentCount || 0;
      return [
        {
          templateId: store.currentSession?.dhikr_template_id || "subhanallah",
          count: currentCount,
          sessions: currentCount > 0 ? 1 : 0,
        },
      ];
    }

    try {
      const progress = await sqliteService.getTodayProgress();
      return progress.templates;
    } catch (err) {
      console.error("Failed to get today's progress:", err);
      return [];
    }
  };

  // Sync with cloud (placeholder for future enhancement)
  const syncToCloud = async () => {
    if (!isPersistenceAvailable) return false;

    try {
      store.updateSyncStatus({ syncing: true });

      // In a real implementation, this would sync local changes to cloud
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate sync

      store.updateSyncStatus({
        syncing: false,
        pendingChanges: 0,
      });

      return true;
    } catch (err) {
      console.error("Failed to sync to cloud:", err);
      store.updateSyncStatus({ syncing: false });
      return false;
    }
  };

  return {
    isInitialized,
    error,
    isPersistenceAvailable,
    databaseType,

    // Actions
    startDhikrSession,
    incrementDhikrCount,
    completeCurrentSession,
    getTodayProgress,
    syncToCloud,

    // Store state
    currentSession: store.currentSession,
    counter: store.counter,
    templates: store.dhikrTemplates,
    sessions: store.sessions,
    syncStatus: store.syncStatus,

    // Store actions (direct access)
    resetCounter: store.resetCounter,
    setTargetCount: store.setTargetCount,
  };
};
