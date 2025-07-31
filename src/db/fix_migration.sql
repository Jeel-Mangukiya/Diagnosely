-- 1. First make sure session_id is nullable (in case it was made non-nullable)
ALTER TABLE chat_messages 
ALTER COLUMN session_id DROP NOT NULL;

-- 2. Create a single default chat session for each user
INSERT INTO chat_sessions (user_id, title)
SELECT DISTINCT m.user_id, 'Previous Chat'
FROM chat_messages m
LEFT JOIN chat_sessions s ON m.user_id = s.user_id
WHERE s.id IS NULL;

-- 3. Update all null session_id messages to point to their user's chat session
UPDATE chat_messages m
SET session_id = (
    SELECT id 
    FROM chat_sessions s 
    WHERE s.user_id = m.user_id 
    ORDER BY s.created_at ASC 
    LIMIT 1
)
WHERE m.session_id IS NULL;

-- 4. Verify no null session_ids remain
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM chat_messages 
        WHERE session_id IS NULL
    ) THEN
        RAISE EXCEPTION 'There are still messages with null session_id';
    END IF;
END $$;

-- 5. Now we can safely make session_id non-nullable
ALTER TABLE chat_messages 
ALTER COLUMN session_id SET NOT NULL; 