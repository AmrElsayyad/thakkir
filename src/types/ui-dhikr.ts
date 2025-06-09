// UI-specific dhikr template type (different from database schema)
export interface UIDhikrTemplate {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reward: string;
  color: string;
  gradient: string;
}

// Helper function to convert database DhikrTemplate to UI format
export const mapDhikrTemplateToUI = (dbTemplate: {
  id: string;
  arabic_text: string;
  transliteration?: string;
  translation: string;
  reference?: string;
}): UIDhikrTemplate => ({
  id: dbTemplate.id,
  arabic: dbTemplate.arabic_text,
  transliteration: dbTemplate.transliteration || '',
  translation: dbTemplate.translation,
  reward: dbTemplate.reference || '',
  color: 'emerald',
  gradient: 'from-emerald-500 to-teal-600',
}); 