import { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, Sparkles, Languages, MessageSquare, Loader2 } from 'lucide-react';
import { aiApi } from '../api/aiApi';
import { ChatMessageBubble, ChatTypingIndicator } from './chat/ChatMessageBubble';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  text: string;
  isBot: boolean;
  type?: 'chat' | 'translation';
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Muraho! I'm your Rwanda AI Travel Assistant. How can I help you today?", isBot: true },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'translate'>('chat');
  const [targetLang, setTargetLang] = useState('kin');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { text: userMessage, isBot: false }]);
    setInput('');
    setLoading(true);

    try {
      if (mode === 'chat') {
        const result = await aiApi.chat({
          message: userMessage,
          history: messages.map(m => ({ role: m.isBot ? 'assistant' : 'user', content: m.text }))
        });
        setMessages((prev) => [...prev, { text: result.response, isBot: true }]);
      } else {
        const result = await aiApi.translate(userMessage, targetLang);
        if (result.success) {
          setMessages((prev) => [...prev, { 
            text: `Translation to ${targetLang.toUpperCase()}: ${result.translatedText}`, 
            isBot: true,
            type: 'translation'
          }]);
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: 'Sorry, I am having trouble connecting to the AI service. Please try again later.', isBot: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group relative"
          >
            <Bot className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            <div className="absolute right-full mr-4 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Need help? Ask AI
            </div>
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="w-[400px] max-w-[calc(100vw-2rem)] h-[600px] bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-900 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-tight">Sura AI Assistant</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Live Integration</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-2 bg-slate-100 mx-6 mt-4 rounded-xl">
              <button
                onClick={() => setMode('chat')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  mode === 'chat' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Travel Chat
              </button>
              <button
                onClick={() => setMode('translate')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  mode === 'translate' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Languages className="w-4 h-4" />
                Translation
              </button>
            </div>

            {mode === 'translate' && (
              <div className="px-6 mt-2">
                <select 
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full bg-slate-50 border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-600 focus:ring-primary"
                >
                  <option value="kin">Kinyarwanda</option>
                  <option value="fr">French</option>
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                </select>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-slate-50/80 p-6 space-y-4">
              {messages.map((message, index) => (
                <ChatMessageBubble
                  key={index}
                  role={message.isBot ? 'assistant' : 'user'}
                  content={message.text}
                />
              ))}
              <AnimatePresence>{loading && <ChatTypingIndicator />}</AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-slate-100 bg-white">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={mode === 'chat' ? "Ask about Rwanda..." : "Type text to translate..."}
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-primary text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-4 text-center">
                Powered by Groq & LibreTranslate
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
