import styles from './DhikrCounter.module.css';

interface DhikrHeaderProps {
  className?: string;
}

export const DhikrHeader = ({ className }: DhikrHeaderProps) => (
  <header className={`${styles.header} ${className || ""}`}>
    <div className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <div className={styles.headerIcon}>
          <span className={styles.headerIconEmoji}>📿</span>
        </div>
        <h1 className={styles.headerTitle}>
          <span className="font-arabic arabic-text bidi-isolate">تسبيح</span>
        </h1>
        <p className={styles.headerSubtitle}>Islamic Dhikr Counter</p>
        <p className={styles.headerDescription}>Remembrance of Allah (swt)</p>
      </div>
    </div>
  </header>
);
