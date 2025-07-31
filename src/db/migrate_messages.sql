-- Create a chat session for each user that has messages
WITH user_sessions AS (
  INSERT INTO chat_sessions (user_id, title)
  SELECT DISTINCT user_id, 'Previous Chat' as title
  FROM chat_messages
  WHERE session_id IS NULL
  RETURNING id, user_id
)
-- Update the messages to link them to the new sessions
UPDATE chat_messages
SET session_id = user_sessions.id
FROM user_sessions
WHERE chat_messages.user_id = user_sessions.user_id
AND chat_messages.session_id IS NULL; 