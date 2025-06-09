import { v4 as uuidv4 } from 'uuid';

import type { Client } from '@libsql/client';
import type { 
  DhikrTemplate, 
  DhikrSession, 
  UserGoal,
  DhikrSessionWithTemplate 
} from '@/types/dhikr';

export class DhikrService {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  // Dhikr Template operations
  async getDhikrTemplates(): Promise<DhikrTemplate[]> {
    try {
      const result = await this.client.execute('SELECT * FROM dhikr_templates ORDER BY created_at DESC');
      return result.rows.map(row => ({
        id: row.id as string,
        arabic_text: row.arabic_text as string,
        transliteration: row.transliteration as string || undefined,
        translation: row.translation as string,
        category: row.category as string || undefined,
        reference: row.reference as string || undefined,
        created_at: row.created_at as string,
      }));
    } catch (error) {
      console.error('Failed to get dhikr templates:', error);
      return [];
    }
  }

  async addDhikrTemplate(template: Omit<DhikrTemplate, 'id' | 'created_at'>): Promise<DhikrTemplate> {
    const id = uuidv4();
    const created_at = new Date().toISOString();
    
    const newTemplate: DhikrTemplate = {
      ...template,
      id,
      created_at,
    };

    try {
      await this.client.execute({
        sql: `INSERT INTO dhikr_templates (id, arabic_text, transliteration, translation, category, reference, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [id, template.arabic_text, template.transliteration || null, template.translation, template.category || null, template.reference || null, created_at],
      });

      return newTemplate;
    } catch (error) {
      console.error('Failed to add dhikr template:', error);
      throw error;
    }
  }

  async updateDhikrTemplate(id: string, updates: Partial<DhikrTemplate>): Promise<void> {
    try {
      const setClause = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'created_at')
        .map(key => `${key} = ?`)
        .join(', ');
      
      const values = Object.entries(updates)
        .filter(([key]) => key !== 'id' && key !== 'created_at')
        .map(([, value]) => value);

      await this.client.execute({
        sql: `UPDATE dhikr_templates SET ${setClause} WHERE id = ?`,
        args: [...values, id],
      });
    } catch (error) {
      console.error('Failed to update dhikr template:', error);
      throw error;
    }
  }

  async deleteDhikrTemplate(id: string): Promise<void> {
    try {
      await this.client.execute({
        sql: 'DELETE FROM dhikr_templates WHERE id = ?',
        args: [id],
      });
    } catch (error) {
      console.error('Failed to delete dhikr template:', error);
      throw error;
    }
  }

  // Session operations
  async createDhikrSession(userId: string, templateId: string, targetCount?: number): Promise<DhikrSession> {
    const id = uuidv4();
    const started_at = new Date().toISOString();
    
    const session: DhikrSession = {
      id,
      user_id: userId,
      dhikr_template_id: templateId,
      count: 0,
      target_count: targetCount,
      started_at,
      is_completed: false,
    };

    try {
      await this.client.execute({
        sql: `INSERT INTO dhikr_sessions (id, user_id, dhikr_template_id, count, target_count, started_at, is_completed)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [id, userId, templateId, 0, targetCount || null, started_at, false],
      });

      return session;
    } catch (error) {
      console.error('Failed to create dhikr session:', error);
      throw error;
    }
  }

  async incrementDhikrCount(sessionId: string, method: 'tap' | 'voice' | 'auto'): Promise<void> {
    const countId = uuidv4();
    const timestamp = new Date().toISOString();

    try {
      // Start a transaction for atomic operations
      await this.client.batch([
        // Add individual count record
        {
          sql: `INSERT INTO dhikr_counts (id, session_id, count_method, timestamp) VALUES (?, ?, ?, ?)`,
          args: [countId, sessionId, method, timestamp],
        },
        // Update session count
        {
          sql: `UPDATE dhikr_sessions SET count = count + 1 WHERE id = ?`,
          args: [sessionId],
        },
      ]);
    } catch (error) {
      console.error('Failed to increment dhikr count:', error);
      throw error;
    }
  }

  async completeSession(sessionId: string): Promise<void> {
    const completed_at = new Date().toISOString();

    try {
      await this.client.execute({
        sql: `UPDATE dhikr_sessions SET is_completed = ?, completed_at = ? WHERE id = ?`,
        args: [true, completed_at, sessionId],
      });
    } catch (error) {
      console.error('Failed to complete session:', error);
      throw error;
    }
  }

  async getDhikrSessions(userId: string, limit?: number): Promise<DhikrSessionWithTemplate[]> {
    try {
      const sql = `
        SELECT 
          s.*,
          t.arabic_text,
          t.transliteration,
          t.translation,
          t.category,
          t.reference
        FROM dhikr_sessions s
        JOIN dhikr_templates t ON s.dhikr_template_id = t.id
        WHERE s.user_id = ?
        ORDER BY s.started_at DESC
        ${limit ? `LIMIT ${limit}` : ''}
      `;

      const result = await this.client.execute({
        sql,
        args: [userId],
      });

      return result.rows.map(row => ({
        id: row.id as string,
        user_id: row.user_id as string,
        dhikr_template_id: row.dhikr_template_id as string,
        count: row.count as number,
        target_count: row.target_count as number || undefined,
        started_at: row.started_at as string,
        completed_at: row.completed_at as string || undefined,
        is_completed: Boolean(row.is_completed),
        template: {
          id: row.dhikr_template_id as string,
          arabic_text: row.arabic_text as string,
          transliteration: row.transliteration as string || undefined,
          translation: row.translation as string,
          category: row.category as string || undefined,
          reference: row.reference as string || undefined,
          created_at: '', // Not needed for this join
        },
      }));
    } catch (error) {
      console.error('Failed to get dhikr sessions:', error);
      return [];
    }
  }

  async getDailyProgress(userId: string, date: string): Promise<DhikrSessionWithTemplate[]> {
    try {
      const startOfDay = `${date} 00:00:00`;
      const endOfDay = `${date} 23:59:59`;

      const sql = `
        SELECT 
          s.*,
          t.arabic_text,
          t.transliteration,
          t.translation,
          t.category,
          t.reference
        FROM dhikr_sessions s
        JOIN dhikr_templates t ON s.dhikr_template_id = t.id
        WHERE s.user_id = ? 
        AND s.started_at >= ? 
        AND s.started_at <= ?
        ORDER BY s.started_at DESC
      `;

      const result = await this.client.execute({
        sql,
        args: [userId, startOfDay, endOfDay],
      });

      return result.rows.map(row => ({
        id: row.id as string,
        user_id: row.user_id as string,
        dhikr_template_id: row.dhikr_template_id as string,
        count: row.count as number,
        target_count: row.target_count as number || undefined,
        started_at: row.started_at as string,
        completed_at: row.completed_at as string || undefined,
        is_completed: Boolean(row.is_completed),
        template: {
          id: row.dhikr_template_id as string,
          arabic_text: row.arabic_text as string,
          transliteration: row.transliteration as string || undefined,
          translation: row.translation as string,
          category: row.category as string || undefined,
          reference: row.reference as string || undefined,
          created_at: '',
        },
      }));
    } catch (error) {
      console.error('Failed to get daily progress:', error);
      return [];
    }
  }

  // User Goals
  async setUserGoal(userId: string, templateId: string, dailyTarget?: number, weeklyTarget?: number): Promise<UserGoal> {
    const id = uuidv4();
    const created_at = new Date().toISOString();

    const goal: UserGoal = {
      id,
      user_id: userId,
      dhikr_template_id: templateId,
      daily_target: dailyTarget,
      weekly_target: weeklyTarget,
      is_active: true,
      created_at,
    };

    try {
      // Deactivate existing goals for this template
      await this.client.execute({
        sql: `UPDATE user_goals SET is_active = ? WHERE user_id = ? AND dhikr_template_id = ?`,
        args: [false, userId, templateId],
      });

      // Insert new goal
      await this.client.execute({
        sql: `INSERT INTO user_goals (id, user_id, dhikr_template_id, daily_target, weekly_target, is_active, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [id, userId, templateId, dailyTarget || null, weeklyTarget || null, true, created_at],
      });

      return goal;
    } catch (error) {
      console.error('Failed to set user goal:', error);
      throw error;
    }
  }

  async getUserGoals(userId: string): Promise<UserGoal[]> {
    try {
      const result = await this.client.execute({
        sql: 'SELECT * FROM user_goals WHERE user_id = ? AND is_active = ? ORDER BY created_at DESC',
        args: [userId, true],
      });

      return result.rows.map(row => ({
        id: row.id as string,
        user_id: row.user_id as string,
        dhikr_template_id: row.dhikr_template_id as string,
        daily_target: row.daily_target as number || undefined,
        weekly_target: row.weekly_target as number || undefined,
        is_active: Boolean(row.is_active),
        created_at: row.created_at as string,
      }));
    } catch (error) {
      console.error('Failed to get user goals:', error);
      return [];
    }
  }

  // Sync operation
  async syncToCloud(): Promise<boolean> {
    try {
      // @ts-ignore - Turso offline sync API might not have full types yet
      if (this.client.sync) {
        // @ts-ignore
        await this.client.sync();
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Sync failed, will retry later:', error);
      return false;
    }
  }

  // Initialize with default dhikr templates
  async seedDefaultTemplates(): Promise<void> {
    try {
      // Check if templates already exist
      const existingTemplates = await this.getDhikrTemplates();
      if (existingTemplates.length > 0) {
        return; // Already seeded
      }

      // Default Islamic dhikr templates
      const defaultTemplates = [
        {
          arabic_text: 'سُبْحَانَ اللَّهِ',
          transliteration: 'SubhanAllah',
          translation: 'Glory be to Allah',
          category: 'tasbih',
          reference: 'Common dhikr',
        },
        {
          arabic_text: 'الْحَمْدُ لِلَّهِ',
          transliteration: 'Alhamdulillah',
          translation: 'All praise is due to Allah',
          category: 'tahmid',
          reference: 'Common dhikr',
        },
        {
          arabic_text: 'اللَّهُ أَكْبَرُ',
          transliteration: 'Allahu Akbar',
          translation: 'Allah is the Greatest',
          category: 'takbir',
          reference: 'Common dhikr',
        },
        {
          arabic_text: 'لَا إِلَهَ إِلَّا اللَّهُ',
          transliteration: 'La ilaha illa Allah',
          translation: 'There is no god except Allah',
          category: 'tahlil',
          reference: 'Common dhikr',
        },
        {
          arabic_text: 'أَسْتَغْفِرُ اللَّهَ',
          transliteration: 'Astaghfirullah',
          translation: 'I seek forgiveness from Allah',
          category: 'istighfar',
          reference: 'Common dhikr',
        },
      ];

      // Insert default templates
      for (const template of defaultTemplates) {
        await this.addDhikrTemplate(template);
      }

      console.log('Default dhikr templates seeded successfully');
    } catch (error) {
      console.error('Failed to seed default templates:', error);
    }
  }
} 