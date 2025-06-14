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
  const [testMode, setTestMode] = useState(false);

  // Database integration
  const {
    isInitialized,
    databaseType,
    templates,
    currentSession,
    counter,
    startDhikrSession,
    incrementDhikrCount,
    completeCurrentSession,
    resetCounter,
  } = useDhikrDatabase();

  // Convert database templates to UI format, removing duplicates
  const uiTemplates: UIDhikrTemplate[] = templates.reduce(
    (unique: UIDhikrTemplate[], template) => {
      // Check if this template already exists by id or transliteration
      const existing = unique.find(
        (t) =>
          t.id === template.id || t.transliteration === template.transliteration
      );
      if (!existing) {
        unique.push(mapDhikrTemplateToUI(template));
      }
      return unique;
    },
    []
  );

  // Handle voice recognition results
  const handleVoiceRecognition = useCallback(
    async (result: VoiceRecognitionResult) => {
      console.log("Voice recognition result:", result);

      setLastRecognition(result.transcript);
      setRecognitionError(null);

      if (result.recognized_dhikr && isSessionActive) {
        // Auto-switch to the recognized dhikr if different from current selection
        if (selectedDhikr && result.recognized_dhikr !== selectedDhikr.id) {
          const recognizedTemplate = templates.find(
            (t) => t.id === result.recognized_dhikr
          );
          if (recognizedTemplate) {
            const uiTemplate = mapDhikrTemplateToUI(recognizedTemplate);
            setSelectedDhikr(uiTemplate);
            console.log(
              `Auto-switched to dhikr: ${uiTemplate.transliteration}`
            );
          }
        }

        // Increment count for the recognized dhikr type
        setDhikrCounts((prev) => ({
          ...prev,
          [result.recognized_dhikr!]: (prev[result.recognized_dhikr!] || 0) + 1,
        }));

        // Increment the overall session count
        try {
          await incrementDhikrCount("voice");

          // Provide haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
          }

          console.log(
            `${result.recognized_dhikr} count:`,
            (dhikrCounts[result.recognized_dhikr] || 0) + 1,
            `Total: ${counter.currentCount + 1}`
          );
        } catch (error) {
          console.error("Failed to increment count:", error);
        }
      }
    },
    [
      isSessionActive,
      selectedDhikr?.id, // Only depend on the ID, not the whole object
      incrementDhikrCount,
      templates,
    ] // Stable dependencies only
  );

  // Simple voice recognition with Arabic and English support
  const {
    isListening,
    isSupported,
    currentTranscript,
    startListening,
    stopListening,
    debugInfo,
  } = useVoiceRecognition({
    onRecognition: handleVoiceRecognition,
    onError: useCallback((error: string) => setRecognitionError(error), []),
    continuousListening: true,
    language: "en-US", // English for better compatibility
  });

  // Start a new dhikr session
  const handleStartSession = useCallback(async () => {
    if (!selectedDhikr || !isInitialized) return;

    try {
      await startDhikrSession(selectedDhikr.id, targetCount);
      setIsSessionActive(true);
      setDhikrCounts({});
      setLastRecognition("");
      setRecognitionError(null);

      // Small delay to ensure session is ready
      setTimeout(() => {
        startListening();
      }, 100);
    } catch (err) {
      console.error("Failed to start session:", err);
      setRecognitionError("Failed to start session");
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
      try {
        await completeCurrentSession();
      } catch (error) {
        console.error("Failed to complete session:", error);
      }
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
    try {
      await incrementDhikrCount("tap");

      // Provide haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50]);
      }
    } catch (error) {
      console.error("Failed to increment manually:", error);
    }
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
      {/* Test Mode Banner */}
      {testMode && (
        <div className="border-l-4 p-4 mb-4 rounded-r-lg bg-purple-50 border-purple-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-purple-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-purple-700">
                <strong>🔧 Voice Test Mode:</strong> Testing voice recognition
                without session logic.
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Try saying dhikr phrases to test if voice recognition is
                working. No counts will be saved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Database Status Banner */}
      {!testMode && (
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
            <div className="ml-3 flex-1">
              {databaseType === "sqlite" ? (
                <>
                  <p className="text-sm text-green-700">
                    <strong>Voice Recognition Active:</strong> Speak your dhikr
                    clearly and counts will be automatically tracked!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Supports Arabic and English pronunciations. Data is saved
                    locally and syncs across sessions.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-blue-700">
                    <strong>Demo Mode:</strong> Voice recognition is fully
                    functional!
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Supports Arabic and English pronunciations. Counts work
                    perfectly but won&apos;t be saved between sessions.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
              <span>Listening for dhikr...</span>
            </div>
          )}

          {!isListening && isSessionActive && (
            <div className={styles.errorDisplay}>
              <MicOff size={16} />
              <span className="text-sm text-amber-600">
                Microphone stopped - trying to restart...
              </span>
            </div>
          )}

          {lastRecognition && (
            <div className={styles.recognitionDisplay}>
              <span className="text-sm text-gray-600">
                Heard: &quot;{lastRecognition}&quot;
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
                Processing: &quot;{currentTranscript}&quot;
              </span>
            </div>
          )}

          {/* Debug Information */}
          {(isSessionActive || testMode) && debugInfo.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-gray-700 mb-2">
                Voice Recognition Debug:
              </div>
              <div className="space-y-1">
                {debugInfo.slice(-3).map((info, index) => (
                  <div key={index} className="text-xs text-gray-600 font-mono">
                    {info}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Voice Recognition */}
          {testMode && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-purple-700 mb-2">
                🎤 Voice Test Instructions:
              </div>
              <div className="text-xs text-purple-600 space-y-1">
                <div>
                  • Click &quot;Start Test&quot; and allow microphone access
                </div>
                <div>
                  • Try saying: &quot;Subhan Allah&quot;, &quot;Allahu
                  Akbar&quot;, &quot;Alhamdulillah&quot;
                </div>
                <div>• Watch for transcript and dhikr detection above</div>
                <div>
                  • If nothing appears, check browser console for errors
                </div>
                {isListening && (
                  <div className="text-purple-800 font-semibold">
                    🔴 Microphone is active - try speaking now!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Session Test Instructions */}
          {isSessionActive && !testMode && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-700 mb-2">
                💡 Voice Session Instructions:
              </div>
              <div className="text-xs text-blue-600 space-y-1">
                <div>
                  • Speak clearly: &quot;Subhan Allah&quot; or &quot;Allah
                  Akbar&quot;
                </div>
                <div>• Each recognized dhikr will increment the counter</div>
                <div>
                  • Current total count: {counter.currentCount} / {targetCount}
                </div>
                <div>• Watch the debug info for recognition details</div>
              </div>
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
        {!testMode && !isSessionActive ? (
          <>
            <Button
              onClick={handleStartSession}
              className={styles.startButton}
              disabled={!selectedDhikr || !isSupported}
              size="lg"
            >
              <Play size={24} />
              Start Voice Dhikr
            </Button>

            <Button
              onClick={() => setTestMode(true)}
              variant="outline"
              size="sm"
              disabled={!isSupported}
            >
              🔧 Test Voice Only
            </Button>
          </>
        ) : testMode ? (
          <>
            <Button
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  startListening();
                }
              }}
              className={isListening ? styles.stopButton : styles.startButton}
              size="lg"
            >
              {isListening ? (
                <>
                  <MicOff size={24} />
                  Stop Test
                </>
              ) : (
                <>
                  <Mic size={24} />
                  Start Test
                </>
              )}
            </Button>

            <Button
              onClick={() => {
                setTestMode(false);
                stopListening();
                setLastRecognition("");
                setRecognitionError(null);
              }}
              variant="outline"
              size="sm"
            >
              Exit Test
            </Button>
          </>
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

      {/* Completion Message */}
      {isCompleted && (
        <div className={styles.completionMessage}>
          <div className="text-center">
            <div className="text-2xl mb-2">🎉</div>
            <div className="text-lg font-semibold text-green-600 mb-1">
              Dhikr Complete!
            </div>
            <div className="text-sm text-gray-600">
              May Allah accept your dhikr
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
