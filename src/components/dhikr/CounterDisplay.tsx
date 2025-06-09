import { Button } from '@/components/ui/button';
import { UIDhikrTemplate } from '@/types/ui-dhikr';

import styles from './DhikrCounter.module.css';

interface CounterDisplayProps {
  count: number;
  targetCount: number;
  selectedDhikr: UIDhikrTemplate;
  isCompleted: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  className?: string;
}

export const CounterDisplay = ({
  count,
  targetCount,
  selectedDhikr,
  isCompleted,
  onIncrement,
  onDecrement,
  onReset,
  className,
}: CounterDisplayProps) => {
  const progress = targetCount ? Math.min((count / targetCount) * 100, 100) : 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div
      className={`${styles.card} h-full flex flex-col justify-center ${
        className || ""
      }`}
    >
      {/* Arabic Text Section */}
      <div className="mb-8 text-center">
        <div
          className={`${styles.arabicText} ${styles.arabicTextLarge} arabic-text bidi-isolate`}
        >
          {selectedDhikr.arabic}
        </div>

        <div className="space-y-3">
          <p className={styles.transliteration}>
            {selectedDhikr.transliteration}
          </p>
          <p className={styles.translation}>{selectedDhikr.translation}</p>
          <p className={styles.reward}>{selectedDhikr.reward}</p>
        </div>
      </div>

      {/* Progress Ring */}
      <div
        className={`${styles.progressRing} w-48 h-48 lg:w-56 lg:h-56 xl:w-72 xl:h-72 2xl:w-80 2xl:h-80 mx-auto`}
      >
        <svg
          className={styles.progressSvg}
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={styles.progressCircleBackground}
          />
          {/* Progress circle with gradient */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={styles.progressCircleForeground}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient
              id="progressGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Count display */}
        <div className={styles.progressContent}>
          <div className={styles.progressText}>
            <div className={styles.progressCount}>{count}</div>
            <div className={styles.progressTarget}>of {targetCount}</div>
            <div className={styles.progressPercentage}>
              {Math.round(progress)}%
            </div>
          </div>
        </div>
      </div>

      {/* Completion Message */}
      {isCompleted && (
        <div className={styles.completionMessage}>
          <div className={styles.completionIcons}>
            <span className={styles.completionIconBounce}>✨</span>
            <span className={styles.completionIconStatic}>🤲</span>
            <span className={styles.completionIconBounce}>✨</span>
          </div>
          <p className={`${styles.completionArabic} arabic-text bidi-isolate`}>
            بارك الله فيك!
          </p>
          <p className={styles.completionTitle}>Well done! Target completed</p>
          <p className={styles.completionSubtitle}>
            May Allah accept your dhikr
          </p>
        </div>
      )}

      {/* Counter Button */}
      <div className="space-y-6 flex flex-col items-center">
        <Button
          onClick={onIncrement}
          variant="counter"
          size="counter"
          className={styles.counterButton}
          aria-label={`Increment dhikr count. Current count: ${count}`}
        >
          <div className={styles.counterButtonOverlay} />
          <span className={styles.counterButtonContent}>
            <span
              className={`${styles.counterButtonArabic} arabic-text bidi-isolate`}
            >
              تسبيح
            </span>
            <span className={styles.counterButtonText}>TAP</span>
          </span>
        </Button>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={onReset}
            variant="secondary"
            size="lg"
            className="flex items-center gap-2 text-gray-700 font-semibold"
          >
            <span>🔄</span>
            <span>Reset</span>
          </Button>
          <Button
            onClick={onDecrement}
            disabled={count === 0}
            variant="secondary"
            size="lg"
            className="flex items-center gap-2 text-gray-700 font-semibold disabled:opacity-50"
          >
            <span>↶</span>
            <span>Undo</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
