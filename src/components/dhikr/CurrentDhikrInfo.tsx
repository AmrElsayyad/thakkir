import { UIDhikrTemplate } from '@/types/ui-dhikr';

import styles from './DhikrCounter.module.css';

interface CurrentDhikrInfoProps {
  selectedDhikr: UIDhikrTemplate;
  className?: string;
}

export const CurrentDhikrInfo = ({
  selectedDhikr,
  className,
}: CurrentDhikrInfoProps) => (
  <div className={`${styles.card} ${className || ""}`}>
    <h3 className={styles.sectionTitle}>Current Dhikr</h3>
    <div className="text-center mt-4">
      <div
        className={`${styles.arabicText} text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2`}
      >
        {selectedDhikr.arabic}
      </div>
      <p className="text-base font-semibold text-gray-700 mb-2">
        {selectedDhikr.transliteration}
      </p>
      <p className="text-sm text-gray-600 italic leading-relaxed">
        {selectedDhikr.reward}
      </p>
    </div>
  </div>
);
