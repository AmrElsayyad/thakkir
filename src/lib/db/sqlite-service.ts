import { v4 as uuidv4 } from "uuid";

import type { DhikrTemplate, DhikrSession } from "@/types/dhikr";

// Browser-based SQLite simulation using IndexedDB
class SQLiteService {
  private dbName = "thakkir-db";
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create dhikr_templates table
        if (!db.objectStoreNames.contains("dhikr_templates")) {
          const templatesStore = db.createObjectStore("dhikr_templates", {
            keyPath: "id",
          });
          templatesStore.createIndex("category", "category", { unique: false });
        }

        // Create dhikr_sessions table
        if (!db.objectStoreNames.contains("dhikr_sessions")) {
          const sessionsStore = db.createObjectStore("dhikr_sessions", {
            keyPath: "id",
          });
          sessionsStore.createIndex("user_id", "user_id", { unique: false });
          sessionsStore.createIndex("dhikr_template_id", "dhikr_template_id", {
            unique: false,
          });
          sessionsStore.createIndex("created_date", "started_at", {
            unique: false,
          });
        }
      };
    });
  }

  private getStore(
    storeName: string,
    mode: IDBTransactionMode = "readonly"
  ): IDBObjectStore {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    const transaction = this.db.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  // Dhikr Templates
  async getDhikrTemplates(): Promise<DhikrTemplate[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("dhikr_templates");
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error("Failed to get dhikr templates"));
      };
    });
  }

  async createDhikrTemplate(
    template: Omit<DhikrTemplate, "id">
  ): Promise<DhikrTemplate> {
    const newTemplate: DhikrTemplate = {
      ...template,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const store = this.getStore("dhikr_templates", "readwrite");
      const request = store.add(newTemplate);

      request.onsuccess = () => {
        resolve(newTemplate);
      };

      request.onerror = () => {
        reject(new Error("Failed to create dhikr template"));
      };
    });
  }

  async updateDhikrTemplate(
    id: string,
    updates: Partial<DhikrTemplate>
  ): Promise<DhikrTemplate> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("dhikr_templates", "readwrite");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const template = getRequest.result;
        if (!template) {
          reject(new Error("Dhikr template not found"));
          return;
        }

        const updatedTemplate = { ...template, ...updates };
        const putRequest = store.put(updatedTemplate);

        putRequest.onsuccess = () => {
          resolve(updatedTemplate);
        };

        putRequest.onerror = () => {
          reject(new Error("Failed to update dhikr template"));
        };
      };

      getRequest.onerror = () => {
        reject(new Error("Failed to get dhikr template"));
      };
    });
  }

  async deleteDhikrTemplate(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("dhikr_templates", "readwrite");
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error("Failed to delete dhikr template"));
      };
    });
  }

  // Dhikr Sessions
  async getDhikrSessions(
    filters: {
      userId?: string;
      templateId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    } = {}
  ): Promise<DhikrSession[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("dhikr_sessions");
      const index = filters.userId
        ? store.index("user_id")
        : filters.startDate || filters.endDate
        ? store.index("created_date")
        : null;

      if (!index) {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () =>
          reject(new Error("Failed to get dhikr sessions"));
        return;
      }

      const range =
        filters.startDate || filters.endDate
          ? IDBKeyRange.bound(
              filters.startDate || "",
              filters.endDate || "\uffff",
              false,
              false
            )
          : undefined;

      const cursorRequest = index.openCursor(range);
      const sessions: DhikrSession[] = [];

      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const session = cursor.value;
          if (
            (!filters.templateId ||
              session.dhikr_template_id === filters.templateId) &&
            (!filters.userId || session.user_id === filters.userId)
          ) {
            sessions.push(session);
          }
          cursor.continue();
        } else {
          // Sort by date (newest first)
          sessions.sort(
            (a, b) =>
              new Date(b.started_at).getTime() -
              new Date(a.started_at).getTime()
          );

          // Apply limit
          if (filters.limit) {
            resolve(sessions.slice(0, filters.limit));
          } else {
            resolve(sessions);
          }
        }
      };

      cursorRequest.onerror = () => {
        reject(new Error("Failed to get dhikr sessions"));
      };
    });
  }

  async createDhikrSession(
    session: Omit<DhikrSession, "id">
  ): Promise<DhikrSession> {
    const newSession: DhikrSession = {
      ...session,
      id: uuidv4(),
    };

    return new Promise((resolve, reject) => {
      const store = this.getStore("dhikr_sessions", "readwrite");
      const request = store.add(newSession);

      request.onsuccess = () => {
        resolve(newSession);
      };

      request.onerror = () => {
        reject(new Error("Failed to create dhikr session"));
      };
    });
  }

  async sessionExists(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("dhikr_sessions");
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(!!request.result);
      };

      request.onerror = () => {
        reject(new Error("Failed to check session existence"));
      };
    });
  }

  async updateDhikrSession(
    id: string,
    updates: Partial<DhikrSession>
  ): Promise<DhikrSession> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("dhikr_sessions", "readwrite");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const session = getRequest.result;
        if (!session) {
          reject(new Error("Dhikr session not found"));
          return;
        }

        const updatedSession = { ...session, ...updates };
        const putRequest = store.put(updatedSession);

        putRequest.onsuccess = () => {
          resolve(updatedSession);
        };

        putRequest.onerror = () => {
          reject(new Error("Failed to update dhikr session"));
        };
      };

      getRequest.onerror = () => {
        reject(new Error("Failed to get dhikr session"));
      };
    });
  }

  async deleteDhikrSession(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const store = this.getStore("dhikr_sessions", "readwrite");
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(new Error("Failed to delete dhikr session"));
      };
    });
  }

  // Utility methods
  async getTodayProgress(userId: string = "default-user"): Promise<{
    totalSessions: number;
    totalDhikr: number;
    completedSessions: number;
    templates: Array<{ templateId: string; count: number; sessions: number }>;
  }> {
    const today = new Date().toISOString().split("T")[0];
    const sessions = await this.getDhikrSessions({
      userId,
      startDate: today,
      endDate: today + "T23:59:59.999Z",
    });

    const templateStats = new Map<
      string,
      { count: number; sessions: number }
    >();
    let totalDhikr = 0;
    let completedSessions = 0;

    sessions.forEach((session) => {
      totalDhikr += session.count;
      if (session.is_completed) {
        completedSessions++;
      }

      const existing = templateStats.get(session.dhikr_template_id) || {
        count: 0,
        sessions: 0,
      };
      templateStats.set(session.dhikr_template_id, {
        count: existing.count + session.count,
        sessions: existing.sessions + 1,
      });
    });

    return {
      totalSessions: sessions.length,
      totalDhikr,
      completedSessions,
      templates: Array.from(templateStats.entries()).map(
        ([templateId, stats]) => ({
          templateId,
          ...stats,
        })
      ),
    };
  }

  async clearAllData(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }

      const transaction = this.db.transaction(
        ["dhikr_templates", "dhikr_sessions"],
        "readwrite"
      );

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(new Error("Failed to clear data"));
      };

      transaction.objectStore("dhikr_templates").clear();
      transaction.objectStore("dhikr_sessions").clear();
    });
  }
}

export const sqliteService = new SQLiteService();
