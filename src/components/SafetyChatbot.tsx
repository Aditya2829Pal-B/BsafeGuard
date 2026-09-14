import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { cn } from '../lib/utils';

export function SafetyChatbot() {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'Hello, I am your BsafeGuard assistant. I can provide safety tips, help you set up the app, or guide you in an emergency.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: `Error: ${data.error}` }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'Failed to connect to the assistant.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-neutral-100 flex flex-col h-[400px]">
      <div className="p-4 border-b border-neutral-100 flex items-center bg-neutral-50/50 rounded-t-2xl">
        <Bot size={20} className="text-red-600 mr-2" />
        <h3 className="font-semibold text-neutral-800">Safety Assistant</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-red-600 text-white rounded-br-sm" 
                : "bg-neutral-100 text-neutral-800 rounded-bl-sm"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-neutral-100 text-neutral-500 rounded-2xl rounded-bl-sm px-4 py-2 text-sm flex space-x-1 items-center">
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-3 border-t border-neutral-100">
        <div className="flex items-center relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for safety advice..."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-1.5 rounded-full text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
