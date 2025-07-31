# Chapter 5: AI Chat System

## 5.1 Chat Architecture
The AI chat system is built with the following components:
- **Message Management**: Local state with database persistence
- **Conversation History**: Context-aware chat sessions
- **AI Integration**: OpenRouter API with DeepSeek model
- **Session Management**: Multiple chat sessions per user
- **Real-time Updates**: Live message display with typing indicators

## 5.2 Chat Features
- **Multiple Sessions**: Users can have multiple concurrent chats
- **Message History**: Persistent chat history stored in database
- **Quick Questions**: Pre-defined medical questions for quick access
- **Typing Indicators**: Visual feedback during AI response generation
- **Message Persistence**: All messages saved to database
- **Session Management**: Create, switch between, and delete chat sessions

## 5.3 Chat Database Schema
```sql
-- Chat sessions table
CREATE TABLE public.chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

## 5.4 AI Service Integration
The chat system uses a dedicated service for AI responses:
```typescript
interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OpenRouterService {
  async sendMessage(messages: OpenRouterMessage[]): Promise<string> {
    // API call to OpenRouter with conversation history
  }
}
```

## 5.5 Chat UI Components
- **Message Display**: User/AI message bubbles with distinct styling
- **Input Area**: Text input with send button and Enter key support
- **Sidebar**: Chat session list with management options
- **Welcome Screen**: Initial state with quick question suggestions
- **Mobile Responsive**: Optimized for mobile and desktop viewing
