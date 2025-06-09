import { UIDhikrTemplate } from '@/types/ui-dhikr';

import styles from './DhikrCounter.module.css';

interface DhikrSelectorProps {
  selectedDhikr: UIDhikrTemplate;
  dhikrTemplates: UIDhikrTemplate[];
  onDhikrChange: (dhikr: UIDhikrTemplate) => void;
  className?: string;
}

export const DhikrSelector = ({
  selectedDhikr,
  dhikrTemplates,
  onDhikrChange,
  className,
}: DhikrSelectorProps) => {
  const handleSelectionChange = (dhikrId: string) => {
    const dhikr = dhikrTemplates.find((d) => d.id === dhikrId);
    if (dhikr) {
      onDhikrChange(dhikr);
    }
  };

  return (
    <div className={`${styles.card} ${className || ""}`}>
      <div className={styles.sectionHeader}>
        <div className={`${styles.sectionDot} ${styles.emeraldDot}`} />
        <h3 className={styles.sectionTitle}>Select Dhikr</h3>
      </div>
      <select
        value={selectedDhikr.id}
        onChange={(e) => handleSelectionChange(e.target.value)}
        className={styles.select}
        aria-label="Choose dhikr to recite"
      >
        {dhikrTemplates.map((dhikr) => (
          <option key={dhikr.id} value={dhikr.id}>
            {dhikr.transliteration} - {dhikr.translation}
          </option>
        ))}
      </select>
    </div>
  );
};
