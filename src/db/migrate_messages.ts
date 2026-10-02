import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/chat.types';

type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

async function migrateMessages() {
  try {
    // Get all users who have messages
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('user_id');

    if (messagesError) throw messagesError;
    if (!messages) {
      console.log('No messages found to migrate');
      return;
    }

    const uniqueUserIds = Array.from(new Set(messages.map(msg => msg.user_id)));

    // For each user
    for (const user_id of uniqueUserIds) {
      // Create a new chat session
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id,
          title: 'Previous Chat'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      if (!session) {
        console.error('Failed to create session for user:', user_id);
        continue;
      }

      // Update all messages for this user to be associated with the new session
      const { error: updateError } = await supabase
        .from('chat_messages')
        .update({ session_id: session.id })
        .eq('user_id', user_id)
        .is('session_id', null);

      if (updateError) throw updateError;
      console.log(`Migrated messages for user: ${user_id}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateMessages(); 