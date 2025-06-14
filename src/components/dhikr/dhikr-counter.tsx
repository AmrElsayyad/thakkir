'use client';

import { CheckCircle, Pause, Play, RotateCcw } from "lucide-react";
import React, { useEffect, useState } from 'react';

import { Button } from "@/components/ui/button";
import { useDhikrStore } from "@/stores/dhikr-store";

import type { DhikrTemplate } from '@/types/dhikr';

interface DhikrCounterProps {
  template: DhikrTemplate;
  targetCount?: number;
}

export const DhikrCounter: React.FC<DhikrCounterProps> = ({ 
  template, 
  targetCount 
}) => {
  const {
    counter,
    currentSession,
    incrementCounter,
    resetCounter,
    startNewSession,
    pauseSession,
    resumeSession,
    completeSession,
    setTargetCount,
  } = useDhikrStore();

  const [showRipple, setShowRipple] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  // Set target count when component mounts or target changes
  useEffect(() => {
    if (targetCount && targetCount !== counter.targetCount) {
      setTargetCount(targetCount);
    }
  }, [targetCount, counter.targetCount, setTargetCount]);

  const handleCounterTap = () => {
    if (!counter.isActive || !currentSession) return;

    // Trigger haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Visual feedback
    setShowRipple(true);
    setRippleKey(prev => prev + 1);
    
    setTimeout(() => setShowRipple(false), 300);

    // Increment counter
    incrementCounter();

    // Check if target is reached
    if (counter.targetCount && counter.currentCount + 1 >= counter.targetCount) {
      setTimeout(() => {
        completeSession();
      }, 500);
    }
  };

  const handleStart = () => {
    if (!currentSession) {
      startNewSession(template.id, targetCount);
    } else {
      resumeSession();
    }
  };

  const handlePause = () => {
    pauseSession();
  };

  const handleReset = () => {
    resetCounter();
  };

  const progress = counter.targetCount 
    ? (counter.currentCount / counter.targetCount) * 100 
    : 0;

  const isCompleted = counter.targetCount 
    ? counter.currentCount >= counter.targetCount 
    : false;

  return (
    <div className="flex flex-col items-center space-y-8 p-6">
      {/* Dhikr Text */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800 font-arabic">
          {template.arabic_text}
        </h2>
        {template.transliteration && (
          <p className="text-lg text-gray-600 italic">
            {template.transliteration}
          </p>
        )}
        <p className="text-base text-gray-500">{template.translation}</p>
      </div>

      {/* Progress Ring */}
      {counter.targetCount && (
        <div className="relative">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              className="text-emerald-500 transition-all duration-300 ease-out"
              strokeDasharray={283} // 2 * π * 45
              strokeDashoffset={283 - (283 * progress) / 100}
              style={{
                transition: "stroke-dashoffset 0.3s ease-out",
              }}
            />
          </svg>

          {/* Counter in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div
                className="text-4xl font-bold text-gray-800 transition-all duration-200"
                key={counter.currentCount}
              >
                {counter.currentCount}
              </div>
              {counter.targetCount && (
                <div className="text-sm text-gray-500">
                  of {counter.targetCount}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Counter Button (no progress ring) */}
      {!counter.targetCount && (
        <div className="relative">
          <div className="relative transform transition-transform duration-150 hover:scale-105 active:scale-95">
            <Button
              variant="counter"
              size="counter"
              onClick={handleCounterTap}
              disabled={!counter.isActive}
              className="relative overflow-hidden"
            >
              <span
                key={counter.currentCount}
                className="transition-all duration-200"
              >
                {counter.currentCount}
              </span>

              {/* Ripple effect */}
              {showRipple && (
                <div
                  key={rippleKey}
                  className="absolute inset-0 bg-white rounded-full opacity-60 animate-ping"
                />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* With target count - tap area around progress ring */}
      {counter.targetCount && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer transform transition-transform duration-150 active:scale-98"
          onClick={handleCounterTap}
          style={{
            width: "192px",
            height: "192px",
            margin: "auto",
            borderRadius: "50%",
          }}
        >
          {/* Invisible tap target */}
        </div>
      )}

      {/* Completion celebration */}
      {isCompleted && (
        <div className="flex items-center space-x-2 text-emerald-600 animate-in slide-in-from-bottom-4 duration-300">
          <CheckCircle className="w-6 h-6" />
          <span className="text-lg font-semibold">Target Completed!</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex space-x-4">
        {!counter.isActive ? (
          <Button
            onClick={handleStart}
            size="lg"
            className="flex items-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>{currentSession ? "Resume" : "Start"}</span>
          </Button>
        ) : (
          <Button
            onClick={handlePause}
            variant="outline"
            size="lg"
            className="flex items-center space-x-2"
          >
            <Pause className="w-5 h-5" />
            <span>Pause</span>
          </Button>
        )}

        <Button
          onClick={handleReset}
          variant="secondary"
          size="lg"
          className="flex items-center space-x-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 max-w-md">
        {counter.isActive ? (
          <p>Tap the counter or recite the dhikr aloud to count</p>
        ) : (
          <p>Press start to begin your dhikr session</p>
        )}
      </div>
    </div>
  );
}; 