"use client";

import { AlertCircle, CheckCircle, Database, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useDataCleanup } from "@/lib/db/deduplication";

interface DataCleanupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

type IntegrityReport = {
  totalSessions: number;
  totalTemplates: number;
  duplicateSessions: number;
  orphanedSessions: number;
  lastCleanup: string | null;
};

export const DataCleanupDialog = ({
  isOpen,
  onClose,
  onComplete,
}: DataCleanupDialogProps) => {
  const [integrityReport, setIntegrityReport] =
    useState<IntegrityReport | null>(null);
  const { isCleaningUp, cleanupReport, performCleanup, getIntegrityReport } =
    useDataCleanup();

  useEffect(() => {
    if (isOpen) {
      getIntegrityReport().then(setIntegrityReport);
    }
  }, [isOpen, getIntegrityReport]);

  const handleCleanup = async () => {
    try {
      await performCleanup();
      onComplete?.();
    } catch (error) {
      console.error("Cleanup failed:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center mb-4">
          <Database className="h-6 w-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold">Data Cleanup & Integrity</h3>
        </div>

        {/* Integrity Report */}
        {integrityReport && (
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-gray-700">
              Current Data Status:
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Sessions:</span>
                <span className="font-medium">
                  {integrityReport.totalSessions}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Templates:</span>
                <span className="font-medium">
                  {integrityReport.totalTemplates}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Duplicate Sessions:</span>
                <span
                  className={`font-medium flex items-center ${
                    integrityReport.duplicateSessions > 0
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {integrityReport.duplicateSessions > 0 ? (
                    <AlertCircle size={14} className="mr-1" />
                  ) : (
                    <CheckCircle size={14} className="mr-1" />
                  )}
                  {integrityReport.duplicateSessions}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Orphaned Sessions:</span>
                <span
                  className={`font-medium flex items-center ${
                    integrityReport.orphanedSessions > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {integrityReport.orphanedSessions > 0 ? (
                    <XCircle size={14} className="mr-1" />
                  ) : (
                    <CheckCircle size={14} className="mr-1" />
                  )}
                  {integrityReport.orphanedSessions}
                </span>
              </div>
              {integrityReport.lastCleanup && (
                <div className="text-xs text-gray-500 mt-2">
                  Last cleanup:{" "}
                  {new Date(integrityReport.lastCleanup).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cleanup Recommendation */}
        {integrityReport &&
        (integrityReport.duplicateSessions > 0 ||
          integrityReport.orphanedSessions > 0) ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Data Issues Detected:</strong> Your database contains
                  duplicate or orphaned sessions that can be cleaned up.
                </p>
              </div>
            </div>
          </div>
        ) : integrityReport ? (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  <strong>Data is Clean:</strong> No integrity issues found in
                  your database.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Cleanup Description */}
        <div className="mb-4">
          <h4 className="font-medium mb-2 text-gray-700">
            What does cleanup do?
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Removes duplicate dhikr sessions</li>
            <li>
              • Deletes orphaned sessions (sessions without valid templates)
            </li>
            <li>• Keeps the most complete and recent sessions</li>
            <li>• Improves app performance and storage efficiency</li>
          </ul>
        </div>

        {/* Cleanup Results */}
        {cleanupReport && (
          <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
            <h4 className="font-medium mb-2">Cleanup Results:</h4>
            <div className="space-y-1">
              <p>
                Sessions removed:{" "}
                <span className="font-medium text-red-600">
                  {cleanupReport.sessionResults.removed}
                </span>
              </p>
              <p>
                Sessions kept:{" "}
                <span className="font-medium text-green-600">
                  {cleanupReport.sessionResults.kept}
                </span>
              </p>
              <p>
                Orphaned sessions cleaned:{" "}
                <span className="font-medium text-blue-600">
                  {cleanupReport.orphanedSessions}
                </span>
              </p>
              {cleanupReport.sessionResults.errors.length > 0 && (
                <p>
                  Errors:{" "}
                  <span className="font-medium text-red-600">
                    {cleanupReport.sessionResults.errors.length}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!cleanupReport ? (
            <>
              <Button
                onClick={handleCleanup}
                disabled={
                  isCleaningUp ||
                  !!(
                    integrityReport &&
                    integrityReport.duplicateSessions === 0 &&
                    integrityReport.orphanedSessions === 0
                  )
                }
                className="flex-1"
              >
                {isCleaningUp ? "Cleaning..." : "Start Cleanup"}
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                onClose();
                // Reload the page to reflect changes
                window.location.reload();
              }}
              className="w-full"
            >
              Done - Reload App
            </Button>
          )}
        </div>

        {/* Warning Text */}
        <p className="text-xs text-gray-500 mt-3 text-center">
          ⚠️ This action cannot be undone. Consider backing up your data if you
          have important sessions.
        </p>
      </div>
    </div>
  );
};
