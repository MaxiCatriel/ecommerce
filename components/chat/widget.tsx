'use client';

import { MessageCircle, Send, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  content: string;
  isFromAdmin: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface ApiResponse {
  userMessage?: Message;
  aiMessage?: Message | null;
  error?: string;
}

export function ChatWidget() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && session && status === 'authenticated') {
      fetchMessages();
    }
  }, [isOpen, session, status]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const appendMessagesFromResponse = (data: unknown) => {
    if (!data) {
      return;
    }

    if (Array.isArray(data)) {
      setMessages((prev) => [...prev, ...data]);
      return;
    }

    const { userMessage, aiMessage } = data as ApiResponse;

    if (userMessage) {
      setMessages((prev) => {
        const updated = [...prev, userMessage];
        if (aiMessage) {
          updated.push(aiMessage);
        }
        return updated;
      });
      return;
    }

    if ((data as Message).id) {
      setMessages((prev) => [...prev, data as Message]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageToSend = newMessage.trim();
    if (!messageToSend || isLoading) {
      return;
    }

    setIsLoading(true);
    setNewMessage('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: messageToSend })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      appendMessagesFromResponse(data);

      if ((data as ApiResponse)?.error) {
        console.warn('AI response warning:', (data as ApiResponse).error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageToSend);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return null;
  }

  if (!session || status !== 'authenticated') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-80 h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Chat de Soporte</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Hola! En que podemos ayudarte?</p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isFromAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                      message.isFromAdmin
                        ? 'bg-gray-100 dark:bg-neutral-700 text-gray-900 dark:text-white'
                        : 'bg-blue-600 text-white'
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
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !newMessage.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
