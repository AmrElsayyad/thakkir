"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { VoiceRecognitionResult } from "@/types/dhikr";

interface VoiceRecognitionConfig {
  onRecognition: (result: VoiceRecognitionResult) => void;
  onError?: (error: string) => void;
  continuousListening?: boolean;
  language?: string;
}

export const useVoiceRecognition = ({
  onRecognition,
  onError,
  continuousListening = true,
  language = "en-US", // Changed to English for better compatibility
}: VoiceRecognitionConfig) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isStoppedManuallyRef = useRef(false);
  const lastRestartRef = useRef<number>(0);

  // Use refs for callbacks to avoid recreation issues
  const onRecognitionRef = useRef(onRecognition);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onRecognitionRef.current = onRecognition;
  }, [onRecognition]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Enhanced dhikr patterns for better recognition with more variations
  const dhikrPatterns = useMemo(
    () => ({
      subhanallah: [
        // Arabic
        "سبحان الله",
        "سُبْحَانَ اللَّهِ",
        // English transliterations
        "subhan allah",
        "subhanallah",
        "sophan allah",
        "sub han allah",
        "subhan",
        "subh",
        "soph",
        // Common mispronunciations
        "span allah",
        "sub allah",
        "sobhan",
      ],
      alhamdulillah: [
        // Arabic
        "الحمد لله",
        "الْحَمْدُ لِلَّهِ",
        // English transliterations
        "alhamdulillah",
        "al hamdu lillah",
        "elhamdulillah",
        "alhamdu lillahi",
        "hamd",
        "hamdu",
        "alhamdu",
        // Common mispronunciations
        "al hamdu",
        "hamdullah",
        "hamdu lillah",
      ],
      "allahu-akbar": [
        // Arabic
        "الله أكبر",
        "اللَّهُ أَكْبَرُ",
        // English transliterations
        "allahu akbar",
        "allah akbar",
        "allah u akbar",
        "allaahu akbar",
        "akbar",
        "allah",
        // Common mispronunciations
        "alla akbar",
        "allah akber",
        "alahu akbar",
      ],
      "la-ilaha-illa-allah": [
        // Arabic
        "لا إله إلا الله",
        "لَا إِلَهَ إِلَّا اللَّهُ",
        // English transliterations
        "la ilaha illa allah",
        "la ilaha illallah",
        "laa ilaaha illallahu",
        "la elaha ella allah",
        "la ilaha",
        "illallah",
        "illa allah",
        // Common mispronunciations
        "la elaha illa allah",
        "la ilaha illa",
        "ilaha illa allah",
      ],
      astaghfirullah: [
        // Arabic
        "أستغفر الله",
        "أَسْتَغْفِرُ اللَّهَ",
        // English transliterations
        "astaghfirullah",
        "astagh firullah",
        "estagh ferullah",
        "astagfirallah",
        "astaghfir",
        "astagfir",
        "istighfar",
        // Common mispronunciations
        "astag firullah",
        "astaghfir allah",
        "astagh fir",
      ],
    }),
    []
  );

  // Add debug logging with stable reference
  const addDebug = useCallback((message: string) => {
    console.log(`[Voice Recognition] ${message}`);
    setDebugInfo((prev) => [
      ...prev.slice(-4),
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  }, []);

  // Enhanced dhikr detection with fuzzy matching
  const detectDhikr = useCallback(
    (transcript: string): string | undefined => {
      const cleanTranscript = transcript.toLowerCase().trim();
      addDebug(`Analyzing transcript: "${cleanTranscript}"`);

      // Try exact matches first
      for (const [dhikrId, patterns] of Object.entries(dhikrPatterns)) {
        for (const pattern of patterns) {
          if (cleanTranscript.includes(pattern.toLowerCase())) {
            addDebug(
              `✅ Exact match found: ${dhikrId} (pattern: "${pattern}")`
            );
            return dhikrId;
          }
        }
      }

      // Try word-by-word matching for compound dhikr
      const words = cleanTranscript.split(/\s+/);
      for (const [dhikrId, patterns] of Object.entries(dhikrPatterns)) {
        for (const pattern of patterns) {
          const patternWords = pattern.toLowerCase().split(/\s+/);
          if (patternWords.length > 1) {
            const hasAllWords = patternWords.every((word) =>
              words.some((w) => w.includes(word) || word.includes(w))
            );
            if (hasAllWords) {
              addDebug(
                `✅ Word match found: ${dhikrId} (pattern: "${pattern}")`
              );
              return dhikrId;
            }
          }
        }
      }

      addDebug(`❌ No dhikr detected in: "${cleanTranscript}"`);
      return undefined;
    },
    [dhikrPatterns, addDebug]
  );

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      addDebug("❌ Cannot start - recognition not initialized");
      return;
    }

    if (isListening) {
      addDebug("⚠️ Already listening, skipping start");
      return;
    }

    try {
      isStoppedManuallyRef.current = false;
      lastRestartRef.current = Date.now();
      recognitionRef.current.start();
      addDebug("🎤 Starting voice recognition...");
    } catch (error) {
      addDebug(`❌ Error starting: ${error}`);
      onErrorRef.current?.("Failed to start voice recognition");
    }
  }, [isListening, addDebug]);

  const stopListening = useCallback(() => {
    addDebug("🛑 Stopping voice recognition manually");
    isStoppedManuallyRef.current = true;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        addDebug(`❌ Error stopping: ${error}`);
      }
    }
  }, [isListening, addDebug]);

  const restartRecognition = useCallback(() => {
    if (isStoppedManuallyRef.current) {
      addDebug("⏹️ Manual stop detected, not restarting");
      return;
    }

    const timeSinceLastRestart = Date.now() - lastRestartRef.current;
    if (timeSinceLastRestart < 1000) {
      addDebug("⚠️ Too soon to restart, waiting longer...");
      setTimeout(restartRecognition, 2000);
      return;
    }

    if (recognitionRef.current) {
      try {
        addDebug("🔄 Restarting voice recognition...");
        lastRestartRef.current = Date.now();
        recognitionRef.current.start();
      } catch (error) {
        addDebug(`❌ Restart failed: ${error}`);
        // Try again with exponential backoff
        setTimeout(
          restartRecognition,
          Math.min(5000, timeSinceLastRestart * 2)
        );
      }
    }
  }, [addDebug]);

  // Initialize recognition only once
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      addDebug("❌ Speech recognition not supported");
      onErrorRef.current?.("Speech recognition not supported in this browser");
      return;
    }

    setIsSupported(true);
    addDebug("✅ Speech recognition supported");

    const recognition = new SpeechRecognition();

    // Configure for maximum compatibility and robustness
    recognition.continuous = continuousListening;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 3; // Get multiple alternatives

    addDebug(`🔧 Configured with language: ${language}`);

    // Event handlers
    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentText = finalTranscript || interimTranscript;
      setCurrentTranscript(currentText);

      if (finalTranscript && finalTranscript.trim()) {
        addDebug(`📝 Final transcript: "${finalTranscript.trim()}"`);

        // Try to detect dhikr
        const recognizedDhikr = detectDhikr(finalTranscript);
        const confidence =
          event.results[event.results.length - 1][0].confidence || 0.8;

        if (recognizedDhikr) {
          addDebug(
            `🎯 Dhikr detected: ${recognizedDhikr} (confidence: ${confidence.toFixed(
              2
            )})`
          );

          onRecognitionRef.current({
            transcript: finalTranscript.trim(),
            confidence,
            recognized_dhikr: recognizedDhikr,
          });
        } else {
          // Try alternative results
          const results = event.results[event.results.length - 1];
          for (let i = 1; i < results.length; i++) {
            const altTranscript = results[i].transcript;
            const altDhikr = detectDhikr(altTranscript);
            if (altDhikr) {
              addDebug(
                `🎯 Alternative dhikr detected: ${altDhikr} from "${altTranscript}"`
              );
              onRecognitionRef.current({
                transcript: altTranscript.trim(),
                confidence: results[i].confidence || 0.6,
                recognized_dhikr: altDhikr,
              });
              break;
            }
          }
        }
      } else if (interimTranscript) {
        addDebug(`🔄 Interim: "${interimTranscript.trim()}"`);
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
      addDebug("🎤 Voice recognition started");
    };

    recognition.onend = () => {
      setIsListening(false);
      addDebug("🔇 Voice recognition ended");

      // Auto-restart if not stopped manually
      if (continuousListening && !isStoppedManuallyRef.current) {
        addDebug("🔄 Scheduling restart...");
        restartTimeoutRef.current = setTimeout(restartRecognition, 100);
      }
    };

    recognition.onspeechstart = () => {
      addDebug("🗣️ Speech started");
    };

    recognition.onspeechend = () => {
      addDebug("🤐 Speech ended");
    };

    recognition.onaudiostart = () => {
      addDebug("🔊 Audio started");
    };

    recognition.onaudioend = () => {
      addDebug("🔇 Audio ended");
    };

    recognition.onnomatch = () => {
      addDebug("❓ No match found");
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      addDebug(`❌ Error: ${event.error} - ${event.message || "No message"}`);

      const errorMessage = (() => {
        switch (event.error) {
          case "no-speech":
            addDebug("⏳ No speech detected, will restart...");
            return null; // Don't show error, just restart
          case "audio-capture":
            return "No microphone found. Please check your microphone.";
          case "not-allowed":
            return "Microphone permission denied. Please allow microphone access.";
          case "network":
            return "Network error. Check your internet connection.";
          case "aborted":
            addDebug("🛑 Recognition aborted");
            return null;
          case "service-not-allowed":
            return "Speech recognition service not allowed.";
          default:
            return `Speech recognition error: ${event.error}`;
        }
      })();

      if (errorMessage) {
        onErrorRef.current?.(errorMessage);
      }

      // Auto-restart after recoverable errors
      if (
        continuousListening &&
        !isStoppedManuallyRef.current &&
        !["not-allowed", "audio-capture", "service-not-allowed"].includes(
          event.error
        )
      ) {
        addDebug("🔄 Scheduling restart after error...");
        restartTimeoutRef.current = setTimeout(restartRecognition, 1000);
      }
    };

    recognitionRef.current = recognition;
    addDebug("🎛️ Voice recognition initialized");

    return () => {
      addDebug("🧹 Cleaning up voice recognition");
      isStoppedManuallyRef.current = true;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [
    continuousListening,
    language,
    addDebug,
    detectDhikr,
    restartRecognition,
  ]); // Removed unstable dependencies

  return {
    isListening,
    isSupported,
    currentTranscript,
    startListening,
    stopListening,
    dhikrPatterns: Object.keys(dhikrPatterns),
    debugInfo, // Expose debug info for troubleshooting
  };
};

// Global types for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    grammars: SpeechGrammarList;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    serviceURI: string;

    start(): void;
    stop(): void;
    abort(): void;

    onresult:
      | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
      | null;
    onnomatch:
      | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
      | null;
    onerror:
      | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
      | null;
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly length: number;
    readonly isFinal: boolean;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechGrammarList {
    readonly length: number;
    item(index: number): SpeechGrammar;
    [index: number]: SpeechGrammar;
    addFromURI(src: string, weight?: number): void;
    addFromString(string: string, weight?: number): void;
  }

  interface SpeechGrammar {
    src: string;
    weight: number;
  }

  const SpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };
}
