"use client";

import { useCallback, useEffect, useState } from "react";

import { useIsMobile } from "@/hooks/useMediaQuery";
import { UIDhikrTemplate } from "@/types/ui-dhikr";

import { CelebrationModal } from "./CelebrationModal";
import { DesktopLayout } from "./DesktopLayout";
import styles from "./DhikrCounter.module.css";
import { DhikrHeader } from "./DhikrHeader";
import { MobileLayout } from "./MobileLayout";

const DHIKR_TEMPLATES: UIDhikrTemplate[] = [
  {
    id: "subhanallah",
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "SubhanAllah",
    translation: "Glory be to Allah",
    reward: "Each word weighs like a mountain of rewards",
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "alhamdulillah",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    translation: "All praise is due to Allah",
    reward: "Fills the scales of good deeds",
    color: "teal",
    gradient: "from-teal-500 to-cyan-600",
  },
  {
    id: "allahu-akbar",
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest",
    reward: "More beloved to Allah than all that the sun rises upon",
    color: "green",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "la-ilaha-illa-allah",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ",
    transliteration: "La ilaha illa Allah",
    translation: "There is no god but Allah",
    reward: "The best remembrance and the key to Paradise",
    color: "cyan",
    gradient: "from-cyan-500 to-blue-600",
  },
];

export const DhikrApp = () => {
  const [count, setCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState<UIDhikrTemplate>(
    DHIKR_TEMPLATES[0]
  );
  const [targetCount, setTargetCount] = useState(33);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Responsive layout detection
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleVibration = useCallback(() => {
    if (isMounted && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  }, [isMounted]);

  const handleIncrement = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);

    if (targetCount && newCount >= targetCount) {
      setIsCompleted(true);
      setShowCelebration(true);
      handleVibration();
    }
  }, [count, targetCount, handleVibration]);

  const handleDecrement = useCallback(() => {
    if (count > 0) {
      setCount(count - 1);
      setIsCompleted(false);
    }
  }, [count]);

  const handleReset = useCallback(() => {
    setCount(0);
    setIsCompleted(false);
    setShowCelebration(false);
  }, []);

  const handleDhikrChange = useCallback(
    (dhikr: UIDhikrTemplate) => {
      setSelectedDhikr(dhikr);
      handleReset();
    },
    [handleReset]
  );

  const handleTargetChange = useCallback(
    (target: number) => {
      setTargetCount(target);
      handleReset();
    },
    [handleReset]
  );

  const handleCelebrationClose = useCallback(() => {
    setShowCelebration(false);
  }, []);

  return (
    <div className={styles.container}>
      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.backgroundCircle1} />
        <div className={styles.backgroundCircle2} />
        <div className={styles.backgroundCircle3} />
      </div>

      <DhikrHeader />

      <CelebrationModal
        isVisible={showCelebration}
        onClose={handleCelebrationClose}
      />

      <main className={styles.mainContent}>
        {/* Conditional Rendering - Only ONE layout at a time */}
        {isMounted && !isMobile ? (
          <DesktopLayout
            selectedDhikr={selectedDhikr}
            dhikrTemplates={DHIKR_TEMPLATES}
            onDhikrChange={handleDhikrChange}
            targetCount={targetCount}
            onTargetChange={handleTargetChange}
            count={count}
            isCompleted={isCompleted}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onReset={handleReset}
          />
        ) : (
          <MobileLayout
            selectedDhikr={selectedDhikr}
            dhikrTemplates={DHIKR_TEMPLATES}
            onDhikrChange={handleDhikrChange}
            targetCount={targetCount}
            count={count}
            onIncrement={handleIncrement}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
};
