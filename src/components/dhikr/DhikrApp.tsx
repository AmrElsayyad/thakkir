"use client";

import { useEffect, useState } from "react";

import styles from "./DhikrCounter.module.css";
import { DhikrHeader } from "./DhikrHeader";
import { VoiceDhikrCounter } from "./VoiceDhikrCounter";

export const DhikrApp = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={styles.container}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Thakkir...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.backgroundCircle1} />
        <div className={styles.backgroundCircle2} />
        <div className={styles.backgroundCircle3} />
      </div>

      {/* Header */}
      <DhikrHeader />

      {/* Main Voice-Enabled Dhikr Counter */}
      <main className={styles.mainContent}>
        <VoiceDhikrCounter />
      </main>
    </div>
  );
};
