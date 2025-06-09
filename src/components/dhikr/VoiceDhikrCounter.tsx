"use client";

import { Mic, MicOff, Pause, Play, RotateCcw, Target } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useDhikrDatabase } from '@/hooks/useDhikrDatabase';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { mapDhikrTemplateToUI, UIDhikrTemplate } from '@/types/ui-dhikr';

import styles from './DhikrCounter.module.css';

import type { VoiceRecognitionResult } from "@/types/dhikr";
interface VoiceDhikrCounterProps {
  className?: string;
}

export const VoiceDhikrCounter = ({ className }: VoiceDhikrCounterProps) => {
  const [selectedDhikr, setSelectedDhikr] = useState<UIDhikrTemplate | null>(
    null
  );
  const [targetCount, setTargetCount] = useState(33);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [lastRecognition, setLastRecognition] = useState<string>("");
  const [dhikrCounts, setDhikrCounts] = useState<Record<string, number>>({});

  // Database integration
  const {
    isInitialized,
    error: dbError,
    isPersistenceAvailable,
    databaseType,
    templates,
    currentSession,
    counter,
    startDhikrSession,
    incrementDhikrCount,
    completeCurrentSession,
    resetCounter,
  } = useDhikrDatabase();

  // Convert database templates to UI format
  const uiTemplates: UIDhikrTemplate[] = templates.map(mapDhikrTemplateToUI);

  // Handle voice recognition results
  const handleVoiceRecognition = useCallback(
    async (result: VoiceRecognitionResult) => {
      console.log("Voice recognition:", result);

      setLastRecognition(result.transcript);

      if (result.recognized_dhikr && isSessionActive) {
        // Auto-switch to the recognized dhikr if different from current selection
        if (selectedDhikr && result.recognized_dhikr !== selectedDhikr.id) {
          const recognizedTemplate = uiTemplates.find(
            (t) => t.id === result.recognized_dhikr
          );
          if (recognizedTemplate) {
            setSelectedDhikr(recognizedTemplate);
            console.log(
              `Auto-switched to dhikr: ${recognizedTemplate.transliteration}`
            );
          }
        }

        // Increment count for the recognized dhikr type
        setDhikrCounts((prev) => ({
          ...prev,
          [result.recognized_dhikr!]: (prev[result.recognized_dhikr!] || 0) + 1,
        }));

        // Also increment the overall session count
        await incrementDhikrCount("voice");

        // Provide haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }

        // Clear recognition error if any
        setRecognitionError(null);

        console.log(
          `${result.recognized_dhikr} count:`,
          (dhikrCounts[result.recognized_dhikr] || 0) + 1
        );
      }
    },
    [
      selectedDhikr,
      isSessionActive,
      currentSession,
      uiTemplates,
      incrementDhikrCount,
      dhikrCounts,
    ]
  );

  // Voice recognition
  const {
    isListening,
    isSupported,
    currentTranscript,
    startListening,
    stopListening,
  } = useVoiceRecognition({
    onRecognition: handleVoiceRecognition,
    onError: setRecognitionError,
    continuousListening: true,
    language: "ar-SA",
  });

  // Start a new dhikr session
  const handleStartSession = useCallback(async () => {
    if (!selectedDhikr || !isInitialized) return;

    try {
      await startDhikrSession(selectedDhikr.id, targetCount);
      setIsSessionActive(true);
      startListening();
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  }, [
    selectedDhikr,
    targetCount,
    isInitialized,
    startDhikrSession,
    startListening,
  ]);

  // Stop current session
  const handleStopSession = useCallback(async () => {
    stopListening();
    setIsSessionActive(false);

    if (currentSession) {
      await completeCurrentSession();
    }
  }, [stopListening, currentSession, completeCurrentSession]);

  // Reset everything
  const handleReset = useCallback(async () => {
    stopListening();
    setIsSessionActive(false);
    resetCounter();
    setDhikrCounts({});
    setLastRecognition("");
    setRecognitionError(null);
  }, [stopListening, resetCounter]);

  // Manual increment (tap functionality)
  const handleManualIncrement = useCallback(async () => {
    if (!isSessionActive || !currentSession) return;
    await incrementDhikrCount("tap");
  }, [isSessionActive, currentSession, incrementDhikrCount]);

  // Initialize with first template
  useEffect(() => {
    if (uiTemplates.length > 0 && !selectedDhikr) {
      setSelectedDhikr(uiTemplates[0]);
    }
  }, [uiTemplates, selectedDhikr]);

  // Auto-complete session when target reached
  useEffect(() => {
    if (
      counter.currentCount >= (counter.targetCount || Infinity) &&
      isSessionActive
    ) {
      handleStopSession();
    }
  }, [
    counter.currentCount,
    counter.targetCount,
    isSessionActive,
    handleStopSession,
  ]);

  if (!isInitialized) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing Thakkir...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show info about persistence mode
  const showPersistenceInfo = !isPersistenceAvailable;

  if (!isSupported) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold mb-2">
              Voice recognition not supported
            </p>
            <p className="text-sm">
              Please use a modern browser like Chrome, Safari, or Firefox with
              microphone support
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = counter.currentCount >= (targetCount || Infinity);
  const progress =
    targetCount > 0 ? (counter.currentCount / targetCount) * 100 : 0;

  return (
    <div className={`${styles.voiceContainer} ${className}`}>
      {/* Database Status Banner */}
      <div
        className={`border-l-4 p-4 mb-4 rounded-r-lg ${
          databaseType === "sqlite"
            ? "bg-green-50 border-green-400"
            : "bg-blue-50 border-blue-400"
        }`}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className={`h-5 w-5 ${
                databaseType === "sqlite" ? "text-green-400" : "text-blue-400"
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            {databaseType === "sqlite" ? (
              <>
                <p className="text-sm text-green-700">
                  <strong>Local Storage Active:</strong> Voice recognition with
                  data persistence!
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Your dhikr counts are automatically saved locally and will
                  persist between sessions.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-blue-700">
                  <strong>Demo Mode:</strong> Voice recognition is fully
                  functional!
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Your dhikr counts will work perfectly but won't be saved
                  between sessions. Perfect for trying the app!
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Header with Dhikr Selection */}
      <div className={styles.voiceHeader}>
        <select
          value={selectedDhikr?.id || ""}
          onChange={(e) => {
            const dhikr = uiTemplates.find((d) => d.id === e.target.value);
            if (dhikr) setSelectedDhikr(dhikr);
          }}
          className={styles.dhikrSelect}
          disabled={isSessionActive}
        >
          {uiTemplates.map((dhikr) => (
            <option key={dhikr.id} value={dhikr.id}>
              {dhikr.transliteration}
            </option>
          ))}
        </select>

        <div className={styles.targetSelector}>
          <Target size={16} />
          <input
            type="number"
            value={targetCount}
            onChange={(e) =>
              setTargetCount(Math.max(1, parseInt(e.target.value) || 1))
            }
            className={styles.targetInput}
            disabled={isSessionActive}
            min="1"
            max="1000"
          />
        </div>
      </div>

      {/* Main Display */}
      <div className={styles.voiceMainDisplay}>
        {selectedDhikr && (
          <>
            {/* Arabic Text */}
            <div className={`${styles.arabicText} arabic-text bidi-isolate`}>
              {selectedDhikr.arabic}
            </div>

            {/* Transliteration */}
            <div className={styles.transliteration}>
              {selectedDhikr.transliteration}
            </div>

            {/* Translation */}
            <div className={styles.translation}>
              {selectedDhikr.translation}
            </div>
          </>
        )}

        {/* Counter Display */}
        <div className={styles.counterDisplay}>
          <div className={styles.currentCount}>{counter.currentCount}</div>
          <div className={styles.targetDisplay}>total dhikr</div>
          {selectedDhikr && dhikrCounts[selectedDhikr.id] && (
            <div className={styles.dhikrSpecificCount}>
              {dhikrCounts[selectedDhikr.id]} {selectedDhikr.transliteration}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Status Indicators */}
        <div className={styles.statusIndicators}>
          {isListening && (
            <div className={styles.listeningIndicator}>
              <Mic className="animate-pulse" size={20} />
              <span>Listening...</span>
            </div>
          )}

          {lastRecognition && (
            <div className={styles.recognitionDisplay}>
              <span className="text-sm text-gray-600">
                Heard: "{lastRecognition}"
              </span>
            </div>
          )}

          {recognitionError && (
            <div className={styles.errorDisplay}>
              <span className="text-sm text-red-600">{recognitionError}</span>
            </div>
          )}

          {currentTranscript && (
            <div className={styles.transcriptDisplay}>
              <span className="text-sm text-blue-600">
                "{currentTranscript}"
              </span>
            </div>
          )}

          {/* Dhikr Counts Summary */}
          {isSessionActive && Object.keys(dhikrCounts).length > 0 && (
            <div className={styles.dhikrCountsSummary}>
              <div className="text-sm font-medium text-gray-700 mb-2">
                Session Counts:
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(dhikrCounts).map(([dhikrId, count]) => {
                  const template = uiTemplates.find((t) => t.id === dhikrId);
                  return template ? (
                    <div key={dhikrId} className="flex justify-between">
                      <span className="text-gray-600">
                        {template.transliteration}:
                      </span>
                      <span className="font-semibold text-green-600">
                        {count}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className={styles.voiceControls}>
        {!isSessionActive ? (
          <Button
            onClick={handleStartSession}
            className={styles.startButton}
            disabled={!selectedDhikr || !isSupported}
            size="lg"
          >
            <Play size={24} />
            Start Voice Dhikr
          </Button>
        ) : (
          <>
            <Button
              onClick={handleStopSession}
              className={styles.stopButton}
              size="lg"
            >
              <Pause size={24} />
              Stop Session
            </Button>

            <Button
              onClick={handleManualIncrement}
              className={styles.tapButton}
              variant="secondary"
              size="lg"
            >
              Manual +1
            </Button>
          </>
        )}

        <Button
          onClick={handleReset}
          className={styles.resetButton}
          variant="outline"
          size="sm"
        >
          <RotateCcw size={16} />
          Reset
        </Button>
      </div>

      {/* Completion Celebration */}
      {isCompleted && (
        <div className={styles.completionOverlay}>
          <div className={styles.completionMessage}>
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold mb-2">Alhamdulillah!</h3>
            <p>You completed {counter.currentCount} dhikr</p>
          </div>
        </div>
      )}
    </div>
  );
};
