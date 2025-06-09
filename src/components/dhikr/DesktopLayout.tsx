import { UIDhikrTemplate } from "@/types/ui-dhikr";
import { BenefitsCard } from "./BenefitsCard";
import { CounterDisplay } from "./CounterDisplay";
import { CurrentDhikrInfo } from "./CurrentDhikrInfo";
import styles from "./DhikrCounter.module.css";
import { DhikrSelector } from "./DhikrSelector";
import { ProgressStats } from "./ProgressStats";
import { QuoteCard } from "./QuoteCard";
import { TargetSelector } from "./TargetSelector";

interface DesktopLayoutProps {
  selectedDhikr: UIDhikrTemplate;
  dhikrTemplates: UIDhikrTemplate[];
  onDhikrChange: (dhikr: UIDhikrTemplate) => void;
  targetCount: number;
  onTargetChange: (target: number) => void;
  count: number;
  isCompleted: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
}

export const DesktopLayout = ({
  selectedDhikr,
  dhikrTemplates,
  onDhikrChange,
  targetCount,
  onTargetChange,
  count,
  isCompleted,
  onIncrement,
  onDecrement,
  onReset,
}: DesktopLayoutProps) => {
  return (
    <div className={styles.desktopLayout}>
      <div className={styles.desktopGrid}>
        {/* Left Sidebar */}
        <div className={styles.leftSidebar}>
          <DhikrSelector
            selectedDhikr={selectedDhikr}
            dhikrTemplates={dhikrTemplates}
            onDhikrChange={onDhikrChange}
          />

          <TargetSelector
            targetCount={targetCount}
            onTargetChange={onTargetChange}
          />

          <ProgressStats count={count} targetCount={targetCount} />
        </div>

        {/* Center Content */}
        <div className={styles.centerContent}>
          <CounterDisplay
            count={count}
            targetCount={targetCount}
            selectedDhikr={selectedDhikr}
            isCompleted={isCompleted}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onReset={onReset}
          />
        </div>

        {/* Right Sidebar */}
        <div className={styles.rightSidebar}>
          <QuoteCard />
          <BenefitsCard />
          <CurrentDhikrInfo selectedDhikr={selectedDhikr} />
        </div>
      </div>
    </div>
  );
};
