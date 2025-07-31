import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquarePlus, MessageSquare, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
  messages: Array<{
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
  }>;
}

interface ChatHistorySidebarProps {
  chats: ChatSession[];
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
}) => {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="p-3 border-b">
        <Button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 h-10 bg-primary/10 hover:bg-primary/20 text-primary"
          variant="ghost"
        >
          <MessageSquarePlus size={16} />
          <span className="text-sm font-medium">New Chat</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chats.map((chat) => (
            <div key={chat.id} className="relative group">
              <Button
                variant={currentChatId === chat.id ? "secondary" : "ghost"}
                className={`w-full justify-start text-left p-2.5 h-auto flex flex-col items-start gap-0.5 pr-12
                  ${currentChatId === chat.id ? 'bg-primary/10 hover:bg-primary/15' : 'hover:bg-gray-100'}
                `}
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="flex items-center gap-2 w-full">
                  <MessageSquare size={14} className="shrink-0 text-primary/70" />
                  <span className="font-medium truncate text-sm flex-1">
                    {chat.title || 'New Chat'}
                  </span>
                </div>
                {chat.lastMessage && (
                  <span className="text-xs text-gray-500 truncate w-full pl-6">
                    {chat.lastMessage}
                  </span>
                )}
                <span className="text-[10px] text-gray-400 pl-6">
                  {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 
                  opacity-0 group-hover:opacity-100 transition-opacity
                  md:focus:opacity-100
                  ${currentChatId === chat.id ? 'text-primary' : 'text-gray-500'}
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5 hover:text-red-500 transition-colors" />
              </Button>
            </div>
          ))}
          {chats.length === 0 && (
            <div className="text-center py-8 px-4">
              <div className="mb-3 text-gray-400">
                <MessageSquare size={24} className="mx-auto" />
              </div>
              <p className="text-sm text-gray-500">
                No chats yet. Start a new conversation!
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}; 