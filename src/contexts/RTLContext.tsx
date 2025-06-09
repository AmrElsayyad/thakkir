"use client";

import { createContext, useContext, useEffect, useState } from 'react';

type Direction = "ltr" | "rtl";

interface RTLContextType {
  direction: Direction;
  setDirection: (direction: Direction) => void;
  isRTL: boolean;
}

const RTLContext = createContext<RTLContextType | undefined>(undefined);

export const useRTL = () => {
  const context = useContext(RTLContext);
  if (context === undefined) {
    throw new Error("useRTL must be used within an RTLProvider");
  }
  return context;
};

interface RTLProviderProps {
  children: React.ReactNode;
}

export const RTLProvider = ({ children }: RTLProviderProps) => {
  const [direction, setDirection] = useState<Direction>("ltr");

  useEffect(() => {
    // Get saved direction from localStorage or detect from content
    const savedDirection = localStorage.getItem("textDirection") as Direction;
    if (savedDirection) {
      setDirection(savedDirection);
    } else {
      // Auto-detect RTL based on Arabic content (this is a basic implementation)
      const hasArabicContent =
        document.body.textContent?.match(/[\u0600-\u06FF]/);
      setDirection(hasArabicContent ? "rtl" : "ltr");
    }
  }, []);

  useEffect(() => {
    // Update HTML dir attribute
    document.documentElement.dir = direction;
    // Save to localStorage
    localStorage.setItem("textDirection", direction);
  }, [direction]);

  const value = {
    direction,
    setDirection,
    isRTL: direction === "rtl",
  };

  return <RTLContext.Provider value={value}>{children}</RTLContext.Provider>;
};
