import { Button } from '@/components/ui/button';

import styles from './DhikrCounter.module.css';

interface TargetSelectorProps {
  targetCount: number;
  onTargetChange: (target: number) => void;
  className?: string;
  isMobile?: boolean;
}

const TARGET_OPTIONS = [33, 99, 100, 1000] as const;

export const TargetSelector = ({
  targetCount,
  onTargetChange,
  className,
  isMobile = false,
}: TargetSelectorProps) => {
  const getButtonClasses = (target: number): string => {
    const baseClasses = `${styles.button} font-bold text-base transition-all duration-300 rounded-2xl`;

    if (targetCount === target) {
      return `${baseClasses} ${styles.buttonActive}`;
    }

    return `${baseClasses} ${styles.buttonSecondary}`;
  };

  const gridClasses = isMobile
    ? `${styles.buttonGrid} ${styles.buttonGridFourColumns}`
    : `${styles.buttonGrid} ${styles.buttonGridTwoColumns}`;

  return (
    <div className={`${styles.card} ${className || ""}`}>
      <div className={styles.sectionHeader}>
        <div className={`${styles.sectionDot} ${styles.tealDot}`} />
        <h3 className={styles.sectionTitle}>Target Count</h3>
      </div>
      <div className={gridClasses}>
        {TARGET_OPTIONS.map((target) => (
          <Button
            key={target}
            onClick={() => onTargetChange(target)}
            className={getButtonClasses(target)}
            aria-pressed={targetCount === target}
          >
            {target}
          </Button>
        ))}
      </div>
    </div>
  );
};
