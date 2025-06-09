"use client";

import { useRTL } from '@/contexts/RTLContext';

import { Button } from './button';

interface DirectionToggleProps {
  className?: string;
}

export const DirectionToggle = ({ className }: DirectionToggleProps) => {
  const { setDirection, isRTL } = useRTL();

  const toggleDirection = () => {
    setDirection(isRTL ? "ltr" : "rtl");
  };

  return (
    <Button
      onClick={toggleDirection}
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 ${className || ""}`}
      aria-label={`Switch to ${
        isRTL ? "left-to-right" : "right-to-left"
      } text direction`}
    >
      <span>{isRTL ? "⬅️" : "➡️"}</span>
      <span className="text-xs">{isRTL ? "RTL" : "LTR"}</span>
    </Button>
  );
};
