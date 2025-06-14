import { useState } from "react";

import { sqliteService } from "./sqlite-service";

import type { DhikrSession } from "@/types/dhikr";

// Deduplication utility for dhikr data
export class DataDeduplication {
  // Find duplicate sessions based on multiple criteria
  static async findDuplicateSessions(): Promise<{
    duplicates: DhikrSession[][];
    total: number;
  }> {
    try {
      const allSessions = await sqliteService.getDhikrSessions();
      const duplicateGroups: DhikrSession[][] = [];
      const processedIds = new Set<string>();

      for (const session of allSessions) {
        if (processedIds.has(session.id)) continue;

        // Find potential duplicates for this session
        const duplicates = allSessions.filter(
          (other) =>
            other.id !== session.id &&
            !processedIds.has(other.id) &&
            this.isDuplicateSession(session, other)
        );

        if (duplicates.length > 0) {
          const group = [session, ...duplicates];
          duplicateGroups.push(group);

          // Mark all in this group as processed
          group.forEach((s) => processedIds.add(s.id));
        } else {
          processedIds.add(session.id);
        }
      }

      return {
        duplicates: duplicateGroups,
        total: duplicateGroups.reduce(
          (sum, group) => sum + group.length - 1,
          0
        ),
      };
    } catch (error) {
      console.error("Error finding duplicate sessions:", error);
      return { duplicates: [], total: 0 };
    }
  }

  // Check if two sessions are duplicates
  private static isDuplicateSession(
    session1: DhikrSession,
    session2: DhikrSession
  ): boolean {
    // Same user and template
    const sameUserAndTemplate =
      session1.user_id === session2.user_id &&
      session1.dhikr_template_id === session2.dhikr_template_id;

    if (!sameUserAndTemplate) return false;

    // Started within 5 minutes of each other
    const time1 = new Date(session1.started_at).getTime();
    const time2 = new Date(session2.started_at).getTime();
    const timeDiff = Math.abs(time1 - time2);
    const fiveMinutes = 5 * 60 * 1000;

    const sameTime = timeDiff < fiveMinutes;

    // Similar count (within 10% or exact same target)
    const sameTarget = session1.target_count === session2.target_count;
    const similarCount =
      sameTarget &&
      Math.abs(session1.count - session2.count) <=
        Math.max(1, session1.count * 0.1);

    return sameTime && (sameTarget || similarCount);
  }

  // Remove duplicate sessions, keeping the most complete one
  static async removeDuplicateSessions(): Promise<{
    removed: number;
    kept: number;
    errors: string[];
  }> {
    try {
      const { duplicates } = await this.findDuplicateSessions();
      let removedCount = 0;
      let keptCount = 0;
      const errors: string[] = [];

      for (const group of duplicates) {
        try {
          // Sort by completion status, count, and recency
          const sorted = group.sort((a, b) => {
            // Prioritize completed sessions
            if (a.is_completed !== b.is_completed) {
              return b.is_completed ? 1 : -1;
            }

            // Prioritize higher count
            if (a.count !== b.count) {
              return b.count - a.count;
            }

            // Prioritize more recent
            return (
              new Date(b.started_at).getTime() -
              new Date(a.started_at).getTime()
            );
          });

          // Keep the first one (best), remove the rest
          const toKeep = sorted[0];
          const toRemove = sorted.slice(1);

          console.log(
            `Keeping session ${toKeep.id} (count: ${toKeep.count}, completed: ${toKeep.is_completed})`
          );

          for (const session of toRemove) {
            try {
              await sqliteService.deleteDhikrSession(session.id);
              console.log(`Removed duplicate session ${session.id}`);
              removedCount++;
            } catch (error) {
              const errorMsg = `Failed to remove session ${session.id}: ${error}`;
              console.error(errorMsg);
              errors.push(errorMsg);
            }
          }

          keptCount++;
        } catch (error) {
          const errorMsg = `Error processing duplicate group: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      return { removed: removedCount, kept: keptCount, errors };
    } catch (error) {
      console.error("Error removing duplicate sessions:", error);
      return { removed: 0, kept: 0, errors: [String(error)] };
    }
  }

  // Comprehensive data cleanup
  static async performFullCleanup(): Promise<{
    sessionResults: { removed: number; kept: number; errors: string[] };
    orphanedSessions: number;
  }> {
    console.log("Starting comprehensive data cleanup...");

    // 1. Clean duplicate sessions
    const sessionResults = await this.removeDuplicateSessions();
    console.log(
      `Sessions cleanup: ${sessionResults.removed} removed, ${sessionResults.kept} kept`
    );

    // 3. Remove orphaned sessions (sessions with non-existent templates)
    const orphanedSessions = await this.removeOrphanedSessions();
    console.log(`Orphaned sessions removed: ${orphanedSessions}`);

    return {
      sessionResults,
      orphanedSessions,
    };
  }

  // Remove sessions that reference non-existent templates
  private static async removeOrphanedSessions(): Promise<number> {
    try {
      const allSessions = await sqliteService.getDhikrSessions();
      const allTemplates = await sqliteService.getDhikrTemplates();
      const templateIds = new Set(allTemplates.map((t) => t.id));

      let removedCount = 0;

      for (const session of allSessions) {
        if (!templateIds.has(session.dhikr_template_id)) {
          try {
            await sqliteService.deleteDhikrSession(session.id);
            console.log(
              `Removed orphaned session ${session.id} (template ${session.dhikr_template_id} not found)`
            );
            removedCount++;
          } catch (error) {
            console.error(
              `Failed to remove orphaned session ${session.id}:`,
              error
            );
          }
        }
      }

      return removedCount;
    } catch (error) {
      console.error("Error removing orphaned sessions:", error);
      return 0;
    }
  }

  // Get data integrity report
  static async getDataIntegrityReport(): Promise<{
    totalSessions: number;
    totalTemplates: number;
    duplicateSessions: number;
    orphanedSessions: number;
    lastCleanup: string | null;
  }> {
    try {
      const [sessions, templates, sessionDuplicates] = await Promise.all([
        sqliteService.getDhikrSessions(),
        sqliteService.getDhikrTemplates(),
        this.findDuplicateSessions(),
      ]);

      const templateIds = new Set(templates.map((t) => t.id));
      const orphanedSessions = sessions.filter(
        (s) => !templateIds.has(s.dhikr_template_id)
      ).length;

      return {
        totalSessions: sessions.length,
        totalTemplates: templates.length,
        duplicateSessions: sessionDuplicates.total,
        orphanedSessions,
        lastCleanup: localStorage.getItem("thakkir-last-cleanup"),
      };
    } catch (error) {
      console.error("Error generating data integrity report:", error);
      return {
        totalSessions: 0,
        totalTemplates: 0,
        duplicateSessions: 0,
        orphanedSessions: 0,
        lastCleanup: null,
      };
    }
  }

  // Mark cleanup completion
  static markCleanupCompleted(): void {
    localStorage.setItem("thakkir-last-cleanup", new Date().toISOString());
  }
}

// Auto-cleanup hook for components
export const useDataCleanup = () => {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupReport, setCleanupReport] = useState<{
    sessionResults: { removed: number; kept: number; errors: string[] };
    orphanedSessions: number;
  } | null>(null);

  const performCleanup = async () => {
    setIsCleaningUp(true);
    try {
      const report = await DataDeduplication.performFullCleanup();
      setCleanupReport(report);
      DataDeduplication.markCleanupCompleted();
      return report;
    } catch (error) {
      console.error("Cleanup failed:", error);
      throw error;
    } finally {
      setIsCleaningUp(false);
    }
  };

  const getIntegrityReport = async () => {
    return await DataDeduplication.getDataIntegrityReport();
  };

  return {
    isCleaningUp,
    cleanupReport,
    performCleanup,
    getIntegrityReport,
  };
};
