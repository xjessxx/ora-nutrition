'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  nutritionGoals: {
    goal: string;
    dietaryRestrictions: string;
    learningFocus: string;
  };
}

export default function ChatInterface({ nutritionGoals }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setShowWelcome(false);
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          nutritionGoals,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-6">
      {/* Welcome Section */}
      {showWelcome && (
        <div className="mb-8">
          <div className="bg-cyan-100 border-2 border-cyan-300 rounded-2xl p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-green-800 mb-3">
                  How to use Ora:
                </h2>
                <p className="text-green-900 leading-relaxed">
                  give ora your nutrition goals in the side bar (changes sys prompt) then
                  ora can guide you through planning your meals to match your goal. Ora
                  will not make the plans for you, but instead teach you to be nutrient
                  conscious and use what ingredients you have/like.
                </p>
              </div>
              <button className="text-gray-600 hover:text-gray-800 text-2xl leading-none">
                💬
              </button>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-green-800 mb-4">Ask Ora!</h2>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                message.role === 'user'
                  ? 'bg-green-700 text-white'
                  : 'bg-white border-2 border-gray-200 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-gray-200 rounded-2xl px-6 py-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-green-700 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-700 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-green-700 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-cyan-50 border-2 border-cyan-200 rounded-2xl p-4 flex items-end gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask Ora about nutrition, meal planning, or your dietary goals..."
          className="flex-1 bg-transparent outline-none resize-none text-gray-800 placeholder-gray-500 min-h-[60px] max-h-[200px]"
          rows={2}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="text-green-800 hover:text-green-900 disabled:text-gray-400 transition-colors text-2xl"
        >
          ▶
        </button>
      </div>
    </div>
  );
}