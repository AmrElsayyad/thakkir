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
  language = "ar-SA", // Arabic (Saudi Arabia)
}: VoiceRecognitionConfig) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldRestartRef = useRef(false);

  // Dhikr patterns for recognition
  const dhikrPatterns = useMemo(
    () => ({
      subhanallah: [
        "سبحان الله",
        "سُبْحَانَ اللَّهِ",
        "subhan allah",
        "subhanallah",
      ],
      alhamdulillah: [
        "الحمد لله",
        "الْحَمْدُ لِلَّهِ",
        "alhamdulillah",
        "al hamdu lillah",
      ],
      "allahu-akbar": [
        "الله أكبر",
        "اللَّهُ أَكْبَرُ",
        "allahu akbar",
        "allah akbar",
      ],
      "la-ilaha-illa-allah": [
        "لا إله إلا الله",
        "لَا إِلَهَ إِلَّا اللَّهُ",
        "la ilaha illa allah",
        "la ilaha illallah",
      ],
      astaghfirullah: [
        "أستغفر الله",
        "أَسْتَغْفِرُ اللَّهَ",
        "astaghfirullah",
        "astagh firullah",
      ],
    }),
    []
  );

  // Function to detect which dhikr was spoken
  const detectDhikr = useCallback(
    (transcript: string): string | undefined => {
      const cleanTranscript = transcript.toLowerCase().trim();

      for (const [dhikrId, patterns] of Object.entries(dhikrPatterns)) {
        for (const pattern of patterns) {
          if (cleanTranscript.includes(pattern.toLowerCase())) {
            return dhikrId;
          }
        }
      }
      return undefined;
    },
    [dhikrPatterns]
  );

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    try {
      recognitionRef.current.start();
      setIsListening(true);
      console.log("Voice recognition started");
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      onError?.("Failed to start voice recognition");
    }
  }, [isListening, onError]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
      setIsListening(false);
      shouldRestartRef.current = continuousListening;

      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      console.log("Voice recognition stopped");
    } catch (error) {
      console.error("Error stopping voice recognition:", error);
    }
  }, [continuousListening, isListening]);

  const initializeRecognition = useCallback(() => {
    if (typeof window === "undefined") return;

    // Check browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      onError?.("Speech recognition not supported in this browser");
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();

    // Configure recognition
    recognition.continuous = continuousListening;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    // Event handlers
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

      if (finalTranscript) {
        const recognizedDhikr = detectDhikr(finalTranscript);
        const confidence =
          event.results[event.results.length - 1][0].confidence || 0.8;

        onRecognition({
          transcript: finalTranscript.trim(),
          confidence,
          recognized_dhikr: recognizedDhikr,
        });

        console.log("Recognition result:", {
          transcript: finalTranscript,
          recognizedDhikr,
          confidence,
        });
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Speech recognition started");
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log("Speech recognition ended");

      // Auto-restart if continuous listening is enabled
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
      console.error("Speech recognition error:", event.error);
      setIsListening(false);

      const errorMessage = (() => {
        switch (event.error) {
          case "no-speech":
            return "No speech detected. Try speaking closer to the microphone.";
          case "audio-capture":
            return "No microphone found. Please check your microphone connection.";
          case "not-allowed":
            return "Microphone permission denied. Please allow microphone access.";
          case "network":
            return "Network error. Check your internet connection.";
          default:
            return `Speech recognition error: ${event.error}`;
        }
      })();

      onError?.(errorMessage);
    };

    recognitionRef.current = recognition;
  }, [continuousListening, language, onRecognition, onError, detectDhikr]);

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
    dhikrPatterns: Object.keys(dhikrPatterns),
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
