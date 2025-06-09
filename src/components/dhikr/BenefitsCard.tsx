import styles from './DhikrCounter.module.css';

interface BenefitsCardProps {
  className?: string;
}

const BENEFITS = [
  "Brings peace to the heart",
  "Increases spiritual connection",
  "Earns abundant rewards",
  "Purifies the soul",
] as const;

export const BenefitsCard = ({ className }: BenefitsCardProps) => (
  <div className={`${styles.card} ${className || ""}`}>
    <div className={styles.sectionHeader}>
      <div className={`${styles.sectionDot} ${styles.cyanDot}`} />
      <h3 className={styles.sectionTitle}>Benefits of Dhikr</h3>
    </div>
    <div className={styles.benefitsList}>
      {BENEFITS.map((benefit, index) => (
        <div key={index} className={styles.benefitItem}>
          <div className={styles.benefitDot} />
          <span className={styles.benefitText}>{benefit}</span>
        </div>
      ))}
    </div>
  </div>
);
