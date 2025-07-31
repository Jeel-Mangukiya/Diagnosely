-- 1. Create the chat_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add RLS policies for chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
  ON chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Add session_id column as nullable first
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES chat_sessions(id);

-- 4. Run the migration to populate session_id
WITH user_sessions AS (
  INSERT INTO chat_sessions (user_id, title)
  SELECT DISTINCT user_id, 'Previous Chat' as title
  FROM chat_messages
  WHERE session_id IS NULL
  RETURNING id, user_id
)
UPDATE chat_messages
SET session_id = user_sessions.id
FROM user_sessions
WHERE chat_messages.user_id = user_sessions.user_id
AND chat_messages.session_id IS NULL;

-- 5. After migration, make session_id non-nullable
ALTER TABLE chat_messages 
ALTER COLUMN session_id SET NOT NULL;

-- 6. Update chat_messages RLS policies
DROP POLICY IF EXISTS "Users can create messages in their own sessions" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages in their own sessions" ON chat_messages;

CREATE POLICY "Users can create messages in their own sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in their own sessions"
  ON chat_messages FOR SELECT
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Create document_analysis table
CREATE TABLE IF NOT EXISTS document_analysis (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  file_name text not null,
  original_text text not null,
  analysis text not null,
  confidence text not null,
  type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for document_analysis
ALTER TABLE document_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own document analysis"
  ON document_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own document analysis"
  ON document_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own document analysis"
  ON document_analysis FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own document analysis"
  ON document_analysis FOR DELETE
  USING (auth.uid() = user_id); 