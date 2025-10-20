'use client';

import { MessageCircle, Send, User, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  content: string;
  isFromAdmin: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Conversation {
  userId: string;
  userName: string;
  userEmail: string;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
}

export function AdminChat() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if ((session?.user as any)?.role === 'ADMIN') {
      fetchConversations();
    }
  }, [session]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/admin/messages');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading || !selectedConversation) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          userId: selectedConversation
        }),
      });

      if (response.ok) {
        const message = await response.json();
        setConversations(prev => prev.map(conv => {
          if (conv.userId === selectedConversation) {
            return {
              ...conv,
              messages: [...conv.messages, message],
              lastMessage: message.content,
              lastMessageTime: message.createdAt
            };
          }
          return conv;
        }));
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedConv = conversations.find(c => c.userId === selectedConversation);

  if (!session || (session.user as any)?.role !== 'ADMIN') return null;

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg w-full max-w-6xl mx-auto h-[600px] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r dark:border-neutral-700 flex flex-col">
        <div className="p-4 border-b dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={20} />
            Conversaciones
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
              <p>No hay conversaciones activas</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.userId}
                onClick={() => setSelectedConversation(conv.userId)}
                className={`w-full p-4 text-left border-b dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors ${
                  selectedConversation === conv.userId ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-r-blue-600' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    <User size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {conv.userName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {conv.userEmail}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedConv.userName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedConv.userEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-3">
                {selectedConv.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                        message.isFromAdmin
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t dark:border-neutral-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
              <p>Selecciona una conversaciÃ³n para comenzar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
