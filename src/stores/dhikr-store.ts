import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { 
  DhikrSession, 
  DhikrTemplate, 
  CounterState, 
  SyncStatus,
  Theme,
  NotificationSettings 
} from '@/types/dhikr';

interface DhikrStore {
  // Counter state
  counter: CounterState;
  
  // Current session
  currentSession: DhikrSession | null;
  
  // Dhikr templates
  dhikrTemplates: DhikrTemplate[];
  
  // User sessions history
  sessions: DhikrSession[];
  
  // Sync status
  syncStatus: SyncStatus;
  
  // User preferences
  theme: Theme;
  notifications: NotificationSettings;
  
  // Counter actions
  incrementCounter: () => void;
  resetCounter: () => void;
  setTargetCount: (target: number) => void;
  
  // Session actions
  startNewSession: (templateId: string, targetCount?: number) => void;
  completeSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  
  // Template actions
  addDhikrTemplate: (template: Omit<DhikrTemplate, 'id' | 'created_at'>) => void;
  updateDhikrTemplate: (id: string, updates: Partial<DhikrTemplate>) => void;
  deleteDhikrTemplate: (id: string) => void;
  
  // Sync actions
  updateSyncStatus: (status: Partial<SyncStatus>) => void;
  
  // Settings actions
  setTheme: (theme: Theme) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  
  // Data actions
  loadSessions: (sessions: DhikrSession[]) => void;
  loadTemplates: (templates: DhikrTemplate[]) => void;
}

export const useDhikrStore = create<DhikrStore>()(
  persist(
    (set, get) => ({
      // Initial state
      counter: {
        currentCount: 0,
        isActive: false,
      },
      
      currentSession: null,
      dhikrTemplates: [],
      sessions: [],
      
      syncStatus: {
        isOnline: true,
        pendingChanges: 0,
        syncing: false,
      },
      
      theme: 'light',
      notifications: {
        enabled: true,
        sound: true,
        vibration: true,
        reminders: true,
      },
      
      // Counter actions
      incrementCounter: () => {
        const { counter, currentSession } = get();
        
        if (!counter.isActive || !currentSession) return;
        
        const newCount = counter.currentCount + 1;
        const isCompleted = counter.targetCount ? newCount >= counter.targetCount : false;
        
        set((state) => ({
          counter: {
            ...state.counter,
            currentCount: newCount,
          },
          currentSession: currentSession ? {
            ...currentSession,
            count: newCount,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : currentSession.completed_at,
          } : null,
          syncStatus: {
            ...state.syncStatus,
            pendingChanges: state.syncStatus.pendingChanges + 1,
          },
        }));
      },
      
      resetCounter: () => {
        set((state) => ({
          counter: {
            ...state.counter,
            currentCount: 0,
            isActive: false,
          },
          currentSession: null,
        }));
      },
      
      setTargetCount: (target: number) => {
        set((state) => ({
          counter: {
            ...state.counter,
            targetCount: target,
          },
        }));
      },
      
      // Session actions
      startNewSession: (templateId: string, targetCount?: number) => {
        const sessionId = uuidv4();
        const newSession: DhikrSession = {
          id: sessionId,
          user_id: 'default-user', // TODO: Replace with actual user ID
          dhikr_template_id: templateId,
          count: 0,
          target_count: targetCount,
          started_at: new Date().toISOString(),
          is_completed: false,
        };
        
        set((state) => ({
          currentSession: newSession,
          counter: {
            currentCount: 0,
            targetCount,
            isActive: true,
            sessionId,
          },
          syncStatus: {
            ...state.syncStatus,
            pendingChanges: state.syncStatus.pendingChanges + 1,
          },
        }));
      },
      
      completeSession: () => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const completedSession = {
          ...currentSession,
          is_completed: true,
          completed_at: new Date().toISOString(),
        };
        
        set((state) => ({
          currentSession: null,
          sessions: [...state.sessions, completedSession],
          counter: {
            ...state.counter,
            isActive: false,
          },
          syncStatus: {
            ...state.syncStatus,
            pendingChanges: state.syncStatus.pendingChanges + 1,
          },
        }));
      },
      
      pauseSession: () => {
        set((state) => ({
          counter: {
            ...state.counter,
            isActive: false,
          },
        }));
      },
      
      resumeSession: () => {
        set((state) => ({
          counter: {
            ...state.counter,
            isActive: true,
          },
        }));
      },
      
      // Template actions
      addDhikrTemplate: (template) => {
        const newTemplate: DhikrTemplate = {
          ...template,
          id: uuidv4(),
          created_at: new Date().toISOString(),
        };
        
        set((state) => ({
          dhikrTemplates: [...state.dhikrTemplates, newTemplate],
          syncStatus: {
            ...state.syncStatus,
            pendingChanges: state.syncStatus.pendingChanges + 1,
          },
        }));
      },
      
      updateDhikrTemplate: (id, updates) => {
        set((state) => ({
          dhikrTemplates: state.dhikrTemplates.map((template) =>
            template.id === id ? { ...template, ...updates } : template
          ),
          syncStatus: {
            ...state.syncStatus,
            pendingChanges: state.syncStatus.pendingChanges + 1,
          },
        }));
      },
      
      deleteDhikrTemplate: (id) => {
        set((state) => ({
          dhikrTemplates: state.dhikrTemplates.filter((template) => template.id !== id),
          syncStatus: {
            ...state.syncStatus,
            pendingChanges: state.syncStatus.pendingChanges + 1,
          },
        }));
      },
      
      // Sync actions
      updateSyncStatus: (status) => {
        set((state) => ({
          syncStatus: {
            ...state.syncStatus,
            ...status,
          },
        }));
      },
      
      // Settings actions
      setTheme: (theme) => {
        set({ theme });
      },
      
      updateNotificationSettings: (settings) => {
        set((state) => ({
          notifications: {
            ...state.notifications,
            ...settings,
          },
        }));
      },
      
      // Data actions
      loadSessions: (sessions) => {
        set({ sessions });
      },
      
      loadTemplates: (templates) => {
        set({ dhikrTemplates: templates });
      },
    }),
    {
      name: 'dhikr-store',
      partialize: (state) => ({
        // Only persist user preferences and some basic data
        theme: state.theme,
        notifications: state.notifications,
        dhikrTemplates: state.dhikrTemplates,
        // Don't persist sessions or counter state - they come from database
      }),
    }
  )
); 