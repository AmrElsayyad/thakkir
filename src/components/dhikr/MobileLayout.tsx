import { UIDhikrTemplate } from "@/types/ui-dhikr";
import { Button } from "@/components/ui/button";
import styles from "./DhikrCounter.module.css";

interface MobileLayoutProps {
  selectedDhikr: UIDhikrTemplate;
  dhikrTemplates: UIDhikrTemplate[];
  onDhikrChange: (dhikr: UIDhikrTemplate) => void;
  targetCount: number;
  count: number;
  onIncrement: () => void;
  onReset: () => void;
}

export const MobileLayout = ({
  selectedDhikr,
  dhikrTemplates,
  onDhikrChange,
  targetCount,
  count,
  onIncrement,
  onReset,
}: MobileLayoutProps) => {
  return (
    <div className={styles.mobileLayout}>
      {/* Essential: Dhikr selector (simplified) */}
      <div className={styles.mobileEssentialHeader}>
        <select
          value={selectedDhikr.id}
          onChange={(e) => {
            const dhikr = dhikrTemplates.find((d) => d.id === e.target.value);
            if (dhikr) onDhikrChange(dhikr);
          }}
          className={styles.mobileSelect}
          aria-label="Choose dhikr"
        >
          {dhikrTemplates.map((dhikr) => (
            <option key={dhikr.id} value={dhikr.id}>
              {dhikr.transliteration}
            </option>
          ))}
        </select>
      </div>

      {/* Essential: Counter area */}
      <div className={styles.mobileCounterArea}>
        {/* Current count display */}
        <div className={styles.mobileCountDisplay}>
          <div className={styles.mobileCount}>{count}</div>
          <div className={styles.mobileTarget}>of {targetCount}</div>
        </div>

        {/* Main counter button - most important element */}
        <Button
          onClick={onIncrement}
          className={styles.mobileCounterButton}
          aria-label={`Tap to count. Current: ${count}`}
        >
          <span
            className={`${styles.mobileButtonArabic} arabic-text bidi-isolate`}
          >
            تسبيح
          </span>
          <span className={styles.mobileButtonText}>TAP</span>
        </Button>

        {/* Essential: Basic reset */}
        <Button
          onClick={onReset}
          variant="secondary"
          size="sm"
          className={styles.mobileResetButton}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};
