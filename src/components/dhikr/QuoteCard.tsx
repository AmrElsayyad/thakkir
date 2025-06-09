import styles from './DhikrCounter.module.css';

interface QuoteCardProps {
  className?: string;
}

export const QuoteCard = ({ className }: QuoteCardProps) => (
  <div className={`${styles.quoteCard} ${className || ""}`}>
    <div className={styles.quoteContent}>
      <div className={styles.quoteIcon} aria-hidden="true">
        📿
      </div>
      <p className={styles.quoteText}>
        &quot;Remember Allah much, so that you may be successful&quot;
      </p>
      <p className={styles.quoteAttribution}>— Quran 8:45</p>
    </div>
  </div>
);
