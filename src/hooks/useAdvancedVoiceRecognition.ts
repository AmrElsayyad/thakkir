"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { VoiceRecognitionResult } from "@/types/dhikr";

interface AdvancedVoiceRecognitionConfig {
  onRecognition: (result: VoiceRecognitionResult) => void;
  onError?: (error: string) => void;
  continuousListening?: boolean;
  language?: "arabic" | "english" | "both";
}

// Enhanced dhikr patterns with phonetic variations
const DHIKR_PATTERNS = {
  subhanallah: {
    id: "subhanallah",
    arabic: ["سبحان الله", "سُبْحَانَ اللَّهِ"],
    transliteration: [
      "subhan allah",
      "subhanallah",
      "sobhan allah",
      "sophan allah",
      "sub han allah",
    ],
    keywords: ["subhan", "sophan", "sobhan", "subh"],
    weight: 1.0,
  },
  alhamdulillah: {
    id: "alhamdulillah",
    arabic: ["الحمد لله", "الْحَمْدُ لِلَّهِ"],
    transliteration: [
      "alhamdulillah",
      "al hamdu lillah",
      "elhamdulillah",
      "alhamdu lillahi",
    ],
    keywords: ["hamd", "hamdu", "alhamdu", "elhamdu"],
    weight: 1.0,
  },
  "allahu-akbar": {
    id: "allahu-akbar",
    arabic: ["الله أكبر", "اللَّهُ أَكْبَرُ"],
    transliteration: [
      "allahu akbar",
      "allah akbar",
      "allaahu akbar",
      "allah u akbar",
    ],
    keywords: ["allah", "akbar", "akber"],
    weight: 1.0,
  },
  "la-ilaha-illa-allah": {
    id: "la-ilaha-illa-allah",
    arabic: ["لا إله إلا الله", "لَا إِلَهَ إِلَّا اللَّهُ"],
    transliteration: [
      "la ilaha illa allah",
      "la ilaha illallah",
      "laa ilaaha illallahu",
      "la elaha ella allah",
    ],
    keywords: ["la ilaha", "illallah", "illa allah"],
    weight: 1.0,
  },
  astaghfirullah: {
    id: "astaghfirullah",
    arabic: ["أستغفر الله", "أَسْتَغْفِرُ اللَّهَ"],
    transliteration: [
      "astaghfirullah",
      "astagh firullah",
      "estagh ferullah",
      "astagfirallah",
    ],
    keywords: ["astaghfir", "estagh", "astagfir", "ghfir"],
    weight: 1.0,
  },
};

export const useAdvancedVoiceRecognition = ({
  onRecognition,
  onError,
  continuousListening = true,
  language = "both",
}: AdvancedVoiceRecognitionConfig) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldRestartRef = useRef(false);

  // Enhanced dhikr detection with fuzzy matching
  const detectDhikrAdvanced = useCallback((transcript: string) => {
    const cleanTranscript = transcript.toLowerCase().trim();
    let bestMatch = { dhikr: undefined as string | undefined, confidence: 0 };

    for (const [dhikrId, patterns] of Object.entries(DHIKR_PATTERNS)) {
      // Exact match
      for (const pattern of [...patterns.arabic, ...patterns.transliteration]) {
        if (cleanTranscript.includes(pattern.toLowerCase())) {
          return { dhikr: dhikrId, confidence: 0.95 };
        }
      }

      // Keyword matching
      for (const keyword of patterns.keywords) {
        if (cleanTranscript.includes(keyword.toLowerCase())) {
          const confidence = Math.min(
            0.85,
            (keyword.length / cleanTranscript.length) * 0.85
          );
          if (confidence > bestMatch.confidence) {
            bestMatch = { dhikr: dhikrId, confidence };
          }
        }
      }
    }

    return bestMatch;
  }, []);

  const initializeRecognition = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      onError?.("Speech recognition not supported in this browser");
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = continuousListening;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.lang = language === "arabic" ? "ar-SA" : "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentText = finalTranscript || interimTranscript;
      setCurrentTranscript(currentText);

      if (finalTranscript && finalTranscript.trim()) {
        const detection = detectDhikrAdvanced(finalTranscript);
        const confidence =
          event.results[event.results.length - 1][0].confidence || 0.8;

        if (detection.confidence > 0.6) {
          onRecognition({
            transcript: finalTranscript.trim(),
            confidence: Math.max(confidence, detection.confidence),
            recognized_dhikr: detection.dhikr,
          });

          console.log("Enhanced recognition result:", {
            transcript: finalTranscript,
            detectedDhikr: detection.dhikr,
            confidence: detection.confidence,
          });
        }
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Enhanced speech recognition started");
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log("Enhanced speech recognition ended");

      if (continuousListening && shouldRestartRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && shouldRestartRef.current) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.warn("Could not restart recognition:", error);
            }
          }
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      console.error("Enhanced speech recognition error:", event.error);
      setIsListening(false);

      const errorMessage = (() => {
        switch (event.error) {
          case "no-speech":
            return "No speech detected. Try speaking the dhikr clearly.";
          case "audio-capture":
            return "Microphone not found. Please check your microphone.";
          case "not-allowed":
            return "Microphone permission denied. Please allow microphone access.";
          case "network":
            return "Network error. Check your connection.";
          default:
            return `Speech recognition error: ${event.error}`;
        }
      })();

      onError?.(errorMessage);
    };

    recognitionRef.current = recognition;
  }, [
    continuousListening,
    language,
    onRecognition,
    onError,
    detectDhikrAdvanced,
  ]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    try {
      shouldRestartRef.current = true;
      recognitionRef.current.start();
      console.log("Starting enhanced voice recognition...");
    } catch (error) {
      console.error("Error starting enhanced voice recognition:", error);
      onError?.("Failed to start voice recognition");
    }
  }, [isListening, onError]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        console.log("Enhanced voice recognition stopped");
      } catch (error) {
        console.error("Error stopping voice recognition:", error);
      }
    }
  }, [isListening]);

  useEffect(() => {
    initializeRecognition();

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [initializeRecognition]);

  return {
    isListening,
    isSupported,
    currentTranscript,
    startListening,
    stopListening,
    dhikrPatterns: Object.keys(DHIKR_PATTERNS),
  };
};

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
