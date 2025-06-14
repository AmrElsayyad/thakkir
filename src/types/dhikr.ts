// Database entity types
export interface User {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DhikrTemplate {
  id: string;
  arabic_text: string;
  transliteration?: string;
  translation: string;
  category?: string;
  reference?: string;
  created_at: string;
}

export interface DhikrSession {
  id: string;
  user_id: string;
  dhikr_template_id: string;
  count: number;
  target_count?: number;
  started_at: string;
  completed_at?: string;
  is_completed: boolean;
}

export interface DhikrCount {
  id: string;
  session_id: string;
  count_method: 'tap' | 'voice' | 'auto';
  timestamp: string;
}

export interface UserGoal {
  id: string;
  user_id: string;
  dhikr_template_id: string;
  daily_target?: number;
  weekly_target?: number;
  is_active: boolean;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  time: string; // HH:MM format
  days_of_week?: string; // JSON array of days
  is_active: boolean;
  created_at: string;
}

// UI and application types
export interface DhikrSessionWithTemplate extends DhikrSession {
  template: DhikrTemplate;
}

export interface DailyProgress {
  date: string;
  sessions: DhikrSessionWithTemplate[];
  total_count: number;
  goal_met: boolean;
}

export interface WeeklyProgress {
  week_start: string;
  week_end: string;
  daily_progress: DailyProgress[];
  total_count: number;
  goal_met: boolean;
}

// Counter component props
export interface CounterState {
  currentCount: number;
  targetCount?: number;
  isActive: boolean;
  sessionId?: string;
}

// Voice recognition types
export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  recognized_dhikr?: string;
  detection_method?: "exact" | "fuzzy" | "keyword" | "phonetic";
  raw_alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

// Sync status
export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime?: string;
  pendingChanges: number;
  syncing: boolean;
}

// Theme types
export type Theme = 'light' | 'dark';

// Notification types
export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  reminders: boolean;
} 