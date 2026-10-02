// services/supabaseService.ts

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export { supabase };

export class SupabaseService {
  private static instance: SupabaseService;
  
  private constructor() {}
  
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  async saveMessage(userId: string, sender: 'user' | 'assistant', content: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        sender,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getChatHistory(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async clearChatHistory(userId: string) {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }
}

export const supabaseService = SupabaseService.getInstance();