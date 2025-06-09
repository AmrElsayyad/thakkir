import styles from './DhikrCounter.module.css';

interface ProgressStatsProps {
  count: number;
  targetCount: number;
  className?: string;
}

export const ProgressStats = ({
  count,
  targetCount,
  className,
}: ProgressStatsProps) => {
  const progress = targetCount ? Math.min((count / targetCount) * 100, 100) : 0;
  const remaining = Math.max(targetCount - count, 0);

  return (
    <div className={`${styles.card} ${className || ""}`}>
      <div className={styles.sectionHeader}>
        <div className={`${styles.sectionDot} ${styles.cyanDot}`} />
        <h3 className={styles.sectionTitle}>Progress</h3>
      </div>

      <div className={styles.progressStats}>
        <div className={styles.progressStat}>
          <span className={styles.progressStatLabel}>Completed</span>
          <span className={styles.progressStatValue}>{count}</span>
        </div>

        <div className={styles.progressStat}>
          <span className={styles.progressStatLabel}>Remaining</span>
          <span className={styles.progressStatValue}>{remaining}</span>
        </div>

        <div className={styles.progressStat}>
          <span className={styles.progressStatLabel}>Progress</span>
          <span className={styles.progressStatValue}>
            {Math.round(progress)}%
          </span>
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressBarFill}
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
