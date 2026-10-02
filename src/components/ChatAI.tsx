import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User, Activity, Loader2, Menu, X, FileText, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { openRouterService, OpenRouterMessage } from '@/service/openRouterService';
import { ChatHistorySidebar, ChatSession } from './ChatHistorySidebar';
import { Database } from '@/integrations/supabase/types';
import { AnalysisResult } from '@/types';

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
  const [activeReportName, setActiveReportName] = useState<string | null>(null);
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
  const location = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const getLocalSessions = (userId: string): ChatSession[] => {
    try {
      const raw = localStorage.getItem(`diagnosely_chats_${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.map((s: any) => ({
          ...s,
          updatedAt: new Date(s.updatedAt),
          messages: (s.messages || []).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })).filter((m: any) => !m.content.startsWith('Welcome to Diagnosely AI'))
        }));
      }
    } catch (e) {}
    return [];
  };

  const saveLocalSessions = (userId: string, sessions: ChatSession[]) => {
    try {
      localStorage.setItem(`diagnosely_chats_${userId}`, JSON.stringify(sessions));
    } catch (e) {}
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
      return;
    }

    const initializeChat = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const reportContext = location.state?.reportContext;
          const reportFileName = location.state?.fileName || 'Medical Document';

          if (reportContext) {
            await createReportChat(reportContext, reportFileName);
          } else {
            const sessions = await loadChatSessions();
            if (!sessions || sessions.length === 0) {
              await createNewChat();
            }
          }
        } catch (error) {
          console.error('Error initializing chat:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeChat();
  }, [user, loading, navigate, location.state]);

  const createReportChat = async (reportContext: AnalysisResult, reportFileName: string) => {
    if (!user) return;

    setActiveReportName(reportFileName);
    const fallbackId = 'chat_report_' + Date.now();
    const initialReportNotice = `I have loaded your medical analysis report for **${reportFileName}**.\n\nAsk me any questions about your results, diagnosis summary, potential medication interactions, or recommended follow-up steps!`;

    const reportMessage: Message = {
      id: 'msg_' + Date.now(),
      content: initialReportNotice,
      sender: 'ai',
      timestamp: new Date()
    };

    let newSession: ChatSession = {
      id: fallbackId,
      title: `Report: ${reportFileName.slice(0, 25)}`,
      lastMessage: initialReportNotice,
      updatedAt: new Date(),
      messages: [reportMessage]
    };

    try {
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: `Report: ${reportFileName.slice(0, 25)}`,
        })
        .select()
        .single();

      if (!error && session) {
        newSession.id = session.id;
        await saveMessage(initialReportNotice, 'ai', session.id);
      }
    } catch (error) {
      console.warn('Supabase createReportChat warning (using local session fallback):', error);
    }

    setChatSessions(prev => {
      const updated = [newSession, ...prev];
      saveLocalSessions(user.id, updated);
      return updated;
    });

    setCurrentChatId(newSession.id);
    setMessages(newSession.messages);

    const reportSystemPrompt = `You are Diagnosely AI, an expert medical assistant.
The user is asking questions specifically about their uploaded medical document: "${reportFileName}".

--- REPORT ANALYSIS SUMMARY ---
${reportContext.analysis || 'No summary available.'}

--- ORIGINAL EXTRACTED TEXT ---
${reportContext.originalText || 'No raw text available.'}

Provide clear, accurate, empathetic, and evidence-based answers based on the document report provided above. 
Explain medical terms in simple language. Always clarify that you provide AI decision support and not formal doctor diagnosis.`;

    setConversationHistory([
      {
        role: 'system',
        content: reportSystemPrompt
      },
      {
        role: 'assistant',
        content: initialReportNotice
      }
    ]);
  };

  const loadChatSessions = async (): Promise<ChatSession[]> => {
    if (!user) return [];

    try {
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      if (sessions && sessions.length > 0) {
        const formattedSessions: ChatSession[] = await Promise.all(
          sessions.map(async (session) => {
            const { data: messages } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('session_id', session.id)
              .order('created_at', { ascending: true });

            const formattedMessages = (messages?.map(msg => ({
              id: msg.id,
              content: msg.content,
              sender: msg.sender as 'user' | 'ai',
              timestamp: new Date(msg.created_at)
            })) || []).filter(msg => !msg.content.startsWith('Welcome to Diagnosely AI'));

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
        saveLocalSessions(user.id, formattedSessions);

        if (!currentChatId && formattedSessions.length > 0) {
          setCurrentChatId(formattedSessions[0].id);
          setMessages(formattedSessions[0].messages);
          
          const history: OpenRouterMessage[] = [conversationHistory[0]];
          formattedSessions[0].messages.forEach(msg => {
            history.push({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content
            });
          });
          setConversationHistory(history);
        }
        return formattedSessions;
      }
    } catch (error) {
      console.warn('Supabase chat session load warning (using local sessions fallback):', error);
    }

    // Fallback to local sessions
    const local = getLocalSessions(user.id);
    setChatSessions(local);
    if (!currentChatId && local.length > 0) {
      setCurrentChatId(local[0].id);
      setMessages(local[0].messages);

      const history: OpenRouterMessage[] = [conversationHistory[0]];
      local[0].messages.forEach(msg => {
        history.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
      setConversationHistory(history);
    }
    return local;
  };

  const createNewChat = async () => {
    if (!user) return;
    setActiveReportName(null);

    const fallbackId = 'chat_' + Date.now();

    let newSession: ChatSession = {
      id: fallbackId,
      title: 'New Chat',
      lastMessage: '',
      updatedAt: new Date(),
      messages: []
    };

    try {
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: 'New Chat',
        })
        .select()
        .single();

      if (!error && session) {
        newSession.id = session.id;
      }
    } catch (error) {
      console.warn('Supabase createNewChat warning (using local session fallback):', error);
    }

    setChatSessions(prev => {
      const updated = [newSession, ...prev];
      saveLocalSessions(user.id, updated);
      return updated;
    });

    setCurrentChatId(newSession.id);
    setMessages([]);
    setConversationHistory([
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
  };

  const handleChatSelect = (chatId: string) => {
    const selectedChat = chatSessions.find(chat => chat.id === chatId);
    if (selectedChat) {
      if (!selectedChat.title.startsWith('Report:')) {
        setActiveReportName(null);
      } else {
        setActiveReportName(selectedChat.title.replace(/^Report:\s*/, ''));
      }
      setCurrentChatId(chatId);
      setMessages(selectedChat.messages);
      
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
      await supabase.from('chat_messages').delete().eq('session_id', chatId);
      await supabase.from('chat_sessions').delete().eq('id', chatId);
    } catch (error) {
      console.warn('Supabase delete chat warning (deleting locally):', error);
    }

    const updatedSessions = chatSessions.filter(chat => chat.id !== chatId);
    setChatSessions(updatedSessions);
    saveLocalSessions(user.id, updatedSessions);

    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setMessages([]);
      setConversationHistory([conversationHistory[0]]);
      
      if (updatedSessions.length > 0) {
        handleChatSelect(updatedSessions[0].id);
      }
    }

    toast({
      title: "Chat Deleted",
      description: "The chat session has been deleted.",
    });
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

      if (!messageError) {
        await supabase
          .from('chat_sessions')
          .update({ 
            updated_at: new Date().toISOString(),
            title: sender === 'user' ? content.slice(0, 50) : undefined
          })
          .eq('id', sessionId);
        return message;
      }
    } catch (error) {
      console.warn('Supabase saveMessage warning:', error);
    }

    // Local state sync
    setChatSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === sessionId) {
          const msgObj = {
            id: 'msg_' + Date.now(),
            content,
            sender,
            timestamp: new Date()
          };
          return {
            ...s,
            lastMessage: content,
            updatedAt: new Date(),
            messages: [...s.messages, msgObj]
          };
        }
        return s;
      });
      saveLocalSessions(user.id, updated);
      return updated;
    });

    return null;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user || isTyping) return;

    let chatId = currentChatId;
    if (!chatId) {
      const fallbackId = 'chat_' + Date.now();
      chatId = fallbackId;
      setCurrentChatId(chatId);
    }

    const userMessageContent = inputMessage.trim();
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
    await saveMessage(userMessageContent, 'user', chatId);

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
      await saveMessage(aiResponse, 'ai', chatId);

      // Update chat sessions
      setChatSessions(prev => {
        const updatedSessions = prev.map(session => {
          if (session.id === chatId) {
            const newTitle = (session.title === 'New Chat' || !session.title)
              ? userMessageContent.slice(0, 30) 
              : session.title;
            return {
              ...session,
              title: newTitle,
              lastMessage: aiResponse,
              updatedAt: new Date(),
              messages: [...session.messages, userMessage, aiMessage]
            };
          }
          return session;
        });
        saveLocalSessions(user.id, updatedSessions);
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
    <div className="pt-16 h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-20 left-4 md:hidden z-50 bg-white shadow-md border rounded-xl"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Main Container below 4rem Navbar */}
      <div className="flex flex-col md:flex-row flex-1 h-[calc(100vh-4rem)] bg-gray-50 relative overflow-hidden">
        {/* Sidebar - hidden on mobile by default */}
        <div className={`
          fixed inset-y-0 pt-16 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out 
          md:relative md:translate-x-0 md:h-full md:shadow-md md:pt-0
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
        <div className="flex-1 flex flex-col h-full bg-white md:border-l overflow-hidden">
          {/* Chat header for mobile */}
          <div className="md:hidden px-4 py-3 border-b bg-white flex items-center min-h-[3.5rem] shrink-0">
            <h1 className="text-lg font-semibold text-center flex-1 pr-12">Chat with AI</h1>
          </div>

          {/* Active Report Context Banner */}
          {activeReportName && (
            <div className="bg-emerald-50/90 border-b border-emerald-200 px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center space-x-2.5 text-emerald-900 text-sm font-medium">
                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
                  <FileText className="w-4 h-4 shrink-0" />
                </div>
                <span className="truncate max-w-[200px] sm:max-w-md">
                  Active Report Context: <strong className="font-semibold text-emerald-950">{activeReportName}</strong>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/results')}
                className="text-xs text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/80 h-8 rounded-xl shrink-0 font-medium border border-emerald-200"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Report
              </Button>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 flex flex-col justify-start">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 space-y-6 max-w-2xl mx-auto my-auto">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                  <Bot size={36} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Welcome to Diagnosely AI</h2>
                  <p className="text-gray-500 max-w-md text-sm md:text-base leading-relaxed">
                    Your personal medical assistant. Ask me anything about your health, medications, or medical concerns.
                  </p>
                </div>
                
                {/* Quick question chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-4">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(q)}
                      className="text-left p-3.5 rounded-xl border border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all text-xs md:text-sm text-gray-700 shadow-sm font-medium"
                    >
                      {q}
                    </button>
                  ))}
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
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-800'
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
          <div className="p-4 border-t bg-white shrink-0">
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