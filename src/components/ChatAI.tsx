// components/ChatAI.tsx

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User, Activity, Loader2, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { openRouterService, OpenRouterMessage } from '@/service/openRouterService';
import { ChatHistorySidebar, ChatSession } from './ChatHistorySidebar';
import { Database } from '@/integrations/supabase/types';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatAI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<OpenRouterMessage[]>([
    {
      role: 'system',
      content: `You are Diagnosely AI, a knowledgeable and empathetic medical assistant. 
      You provide accurate, evidence-based medical information while being clear that you don't replace professional medical advice. 
      Always:
      - Be helpful and compassionate
      - Provide clear, accurate medical information
      - Remind users to consult healthcare providers for serious concerns
      - Ask clarifying questions when needed
      - Explain medical terms in simple language
      - Consider drug interactions and contraindications when discussing medications`
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
      return;
    }

    const initializeChat = async () => {
      if (user) {
        await loadChatSessions();
        // Create new chat ONLY if there are no existing chat sessions
        if (chatSessions.length === 0) {
          await createNewChat();
        }
      }
    };

    initializeChat();
  }, [user, loading, navigate]);

  const loadChatSessions = async () => {
    try {
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      if (sessions) {
        const formattedSessions: ChatSession[] = await Promise.all(
          sessions.map(async (session) => {
            const { data: messages } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('session_id', session.id)
              .order('created_at', { ascending: true });

            const formattedMessages = messages?.map(msg => ({
              id: msg.id,
              content: msg.content,
              sender: msg.sender as 'user' | 'ai',
              timestamp: new Date(msg.created_at)
            })) || [];

            return {
              id: session.id,
              title: session.title,
              lastMessage: formattedMessages[formattedMessages.length - 1]?.content || '',
              updatedAt: new Date(session.updated_at),
              messages: formattedMessages
            };
          })
        );

        setChatSessions(formattedSessions);
        if (!currentChatId && formattedSessions.length > 0) {
          setCurrentChatId(formattedSessions[0].id);
          setMessages(formattedSessions[0].messages);
          
          // Rebuild conversation history for context
          const history: OpenRouterMessage[] = [conversationHistory[0]];
          formattedSessions[0].messages.forEach(msg => {
            history.push({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content
            });
          });
          setConversationHistory(history);
        }
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    if (!user) return;

    try {
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: 'New Chat',
        })
        .select()
        .single();

      if (error) throw error;

      const newSession: ChatSession = {
        id: session.id,
        title: session.title,
        lastMessage: '',
        updatedAt: new Date(session.created_at),
        messages: []
      };

      setChatSessions(prev => [newSession, ...prev]);
      setCurrentChatId(newSession.id);
      setMessages([]);
      setConversationHistory([conversationHistory[0]]);

      // Add welcome message
      const welcomeMessage = {
        id: 'welcome',
        content: 'Hello! I\'m Diagnosely AI, your personal medical assistant. How can I help you today?',
        sender: 'ai' as const,
        timestamp: new Date()
      };
      
      await saveMessage(welcomeMessage.content, 'ai', newSession.id);
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
    }
  };

  const handleChatSelect = (chatId: string) => {
    const selectedChat = chatSessions.find(chat => chat.id === chatId);
    if (selectedChat) {
      setCurrentChatId(chatId);
      setMessages(selectedChat.messages);
      
      // Rebuild conversation history
      const history: OpenRouterMessage[] = [conversationHistory[0]];
      selectedChat.messages.forEach(msg => {
        history.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
      setConversationHistory(history);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!user) return;

    try {
      // Delete chat messages first
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', chatId);

      if (messagesError) throw messagesError;

      // Then delete the chat session
      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', chatId);

      if (sessionError) throw sessionError;

      // Update local state
      setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
      
      // If the deleted chat was the current chat, clear the messages
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
        setConversationHistory([conversationHistory[0]]);
        
        // If there are other chats, select the first one
        const remainingChats = chatSessions.filter(chat => chat.id !== chatId);
        if (remainingChats.length > 0) {
          handleChatSelect(remainingChats[0].id);
        }
      }

      toast({
        title: "Chat Deleted",
        description: "The chat has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  const saveMessage = async (content: string, sender: 'user' | 'ai', sessionId: string) => {
    if (!user) return null;

    try {
      const { data: message, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          content,
          sender,
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Update session's last message and updated_at
      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .update({ 
          updated_at: new Date().toISOString(),
          title: sender === 'user' ? content.slice(0, 50) : undefined
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      return message;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user || !currentChatId) return;

    const userMessageContent = inputMessage;
    setInputMessage('');

    // Create and display user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: userMessageContent,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Save user message to database
    await saveMessage(userMessageContent, 'user', currentChatId);

    // Update conversation history
    const updatedHistory: OpenRouterMessage[] = [
      ...conversationHistory,
      { role: 'user', content: userMessageContent }
    ];
    setConversationHistory(updatedHistory);

    try {
      // Get AI response from OpenRouter
      const aiResponse = await openRouterService.sendMessage(updatedHistory);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation history with AI response
      setConversationHistory([
        ...updatedHistory,
        { role: 'assistant', content: aiResponse }
      ]);

      // Save AI response to database
      await saveMessage(aiResponse, 'ai', currentChatId);

      // Update chat sessions
      setChatSessions(prev => {
        const updatedSessions = prev.map(session => {
          if (session.id === currentChatId) {
            return {
              ...session,
              lastMessage: aiResponse,
              updatedAt: new Date(),
              messages: [...session.messages, userMessage, aiMessage]
            };
          }
          return session;
        });
        return updatedSessions;
      });
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage = "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment. If the issue persists, please contact support.";
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      toast({
        title: "Connection Error",
        description: "Unable to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What are the side effects of my medication?",
    "Can I take these drugs together?",
    "How should I manage my blood pressure?",
    "What foods should I avoid with my condition?",
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-gray-50 relative">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-[4.5rem] left-4 md:hidden z-50 bg-white shadow-sm border"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Sidebar - hidden on mobile by default */}
      <div className={`
        fixed inset-y-[4rem] left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out 
        md:relative md:translate-x-0 md:h-full md:shadow-md
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <ChatHistorySidebar
          chats={chatSessions}
          currentChatId={currentChatId}
          onChatSelect={(id) => {
            handleChatSelect(id);
            setIsSidebarOpen(false);
          }}
          onNewChat={() => {
            createNewChat();
            setIsSidebarOpen(false);
          }}
          onDeleteChat={handleDeleteChat}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full bg-white md:border-l">
        {/* Chat header for mobile */}
        <div className="md:hidden px-4 py-3 border-b bg-white flex items-center min-h-[3.5rem]">
          <h1 className="text-lg font-semibold text-center flex-1 pr-12">Chat with AI</h1>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-4">
              <Bot size={40} className="text-gray-400" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Welcome to Diagnosely AI</h2>
                <p className="text-gray-500 max-w-sm">
                  Your personal medical assistant. Ask me anything about your health, medications, or medical concerns.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[85%] md:max-w-[70%] ${
                    message.sender === 'user'
                      ? 'flex-row-reverse space-x-reverse'
                      : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="flex space-x-1 items-center bg-gray-100 px-4 py-2.5 rounded-2xl">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t bg-white">
          <div className="max-w-4xl mx-auto flex flex-col space-y-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isTyping}
                className="flex-1 text-base"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                size="icon"
                className="shrink-0 h-[2.75rem] w-[2.75rem]"
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatAI;