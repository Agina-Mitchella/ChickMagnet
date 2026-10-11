import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  action?: {
    label: string;
    type: 'open_claims' | 'open_traceability' | 'open_wholesale' | 'open_contact';
  };
}

interface ChatbotHelpProps {
  onOpenClaims?: () => void;
  onOpenTraceability?: (batchId?: string) => void;
  onOpenWholesale?: () => void;
}

export default function ChatbotHelp({
  onOpenClaims,
  onOpenTraceability,
  onOpenWholesale
}: ChatbotHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello. Ask me about breeds, chick preparation, vaccinations, wholesale orders, delivery or M-Pesa payment.',
      timestamp: 'Just now'
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickTopics = [
    {
      id: 'breeds',
      label: '🐥 Compare Breeds',
      query: 'What is the difference between Sasso, Kenbro, Kuroiler and Improved Kienyeji?'
    },
    {
      id: 'vaccines',
      label: '💉 Vaccinations',
      query: 'Which vaccinations are completed before sale?'
    },
    {
      id: 'delivery',
      label: '🚚 Delivery',
      query: 'Where do you deliver and how is the delivery fee calculated?'
    },
    {
      id: 'wholesale',
      label: '🏢 Wholesale Rules',
      query: 'What are the wholesale minimums and discounts?'
    },
    {
      id: 'payment',
      label: '📱 M-Pesa Payment',
      query: 'How does M-Pesa payment and order confirmation work?'
    }
  ];

  const handleSendMessage = (textToSend?: string, actionObj?: any) => {
    const text = textToSend || inputMessage.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      let botReplyText = "I can help with breeds, chick preparation, age-based vaccinations, wholesale minimums, countrywide delivery and M-Pesa confirmation. For a question about a specific order, contact ChickMagnet directly.";
      let botAction = actionObj;

      const lower = text.toLowerCase();
      if (lower.includes('sasso') || lower.includes('kenbro') || lower.includes('kuroiler') || lower.includes('breed') || lower.includes('kienyeji')) {
        botReplyText = "Sasso, Kenbro and Kuroiler are distinct commercial chicken types commonly grouped with improved kienyeji in Kenya. Sasso is more meat-forward, Kenbro is a balanced free-range all-rounder, Kuroiler is known for active foraging and adaptability, and Improved Kienyeji is the most locally rooted option. Results still depend on feed, housing and flock management.";
      } else if (lower.includes('claim') || lower.includes('dead') || lower.includes('die') || lower.includes('mortality') || lower.includes('guarantee')) {
        botReplyText = "Report weak, injured or dead chicks to ChickMagnet immediately after delivery. Include your order number, delivery details and clear evidence so the farm can review what happened.";
        botAction = onOpenClaims ? { label: 'Report a delivery problem', type: 'open_claims' } : undefined;
      } else if (lower.includes('vaccin') || lower.includes('health')) {
        botReplyText = "ChickMagnet gives every chicken vaccine due by the selected age and provides the current batch record. The standard programme covers hatchery vaccines on Day 1, boosters around Days 10 to 12 and 18 to 21, Fowl pox at Week 6, Fowl typhoid at Week 8, and a Newcastle booster at Week 18. Future doses after delivery are the buyer’s responsibility and may be adjusted by a veterinary professional.";
      } else if (lower.includes('wholesale') || lower.includes('discount') || lower.includes('minimum')) {
        botReplyText = "The wholesale minimum for chicken is 10 birds from one listing: one breed and one age. Different breeds or ages cannot be combined to reach 10. There is no automatic wholesale discount, although ChickMagnet may offer one at its discretion for larger quantities.";
        botAction = { label: 'Explore Wholesale Portal', type: 'open_wholesale' };
      } else if (lower.includes('deliver') || lower.includes('shipping') || lower.includes('transit') || lower.includes('countrywide')) {
        botReplyText = "ChickMagnet delivers countrywide. Delivery is quoted separately after the order is reviewed because distance, quantity and handling needs differ. Product availability and the exact delivery date are confirmed after payment.";
      } else if (lower.includes('pay') || lower.includes('mpesa') || lower.includes('confirmation')) {
        botReplyText = "Checkout collects the product amount through M-Pesa Send Money. Send the full M-Pesa confirmation message to 0724300781. Manual confirmation takes about 2 to 24 hours. Delivery is quoted separately.";
      } else if (lower.includes('sex') || lower.includes('male') || lower.includes('female')) {
        botReplyText = "Chicks are sold unsexed. ChickMagnet cannot guarantee sex, but the farm tries to balance male and female chicks where possible.";
      } else if (lower.includes('prepare') || lower.includes('brooder') || lower.includes('heat') || lower.includes('housing')) {
        botReplyText = "Prepare a clean, disinfected and pre-heated brooder before chicks arrive. Provide dry litter, safe heat, fresh air without draughts, chick starter feed, clean water, enough feeder and drinker space, basic chick-care supplies and a written plan for the next vaccines due.";
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: botAction
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleActionClick = (actionType: string) => {
    setIsOpen(false);
    if (actionType === 'open_claims' && onOpenClaims) onOpenClaims();
    if (actionType === 'open_traceability' && onOpenTraceability) onOpenTraceability('BATCH-2026-CHX9');
    if (actionType === 'open_wholesale' && onOpenWholesale) onOpenWholesale();
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      
      {/* Floating Toggle Icon Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            id="chatbot-help-button"
            className="group relative bg-[#123524] hover:bg-[#0b2217] text-amber-300 p-3.5 sm:p-4 rounded-full shadow-2xl border-2 border-amber-400/80 flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer"
            aria-label="Open ChickMagnet Help & Chatbot"
          >
            <div className="relative">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#123524] animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#123524]" />
            </div>
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 group-hover:ml-2 font-mono font-bold text-xs text-amber-300">
              ChickMagnet Support
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Chat Drawer Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-[#123524] text-amber-50 rounded-3xl w-[calc(100vw-32px)] sm:w-[380px] h-[480px] sm:h-[520px] max-h-[82vh] shadow-2xl border-2 border-amber-400/60 flex flex-col overflow-hidden text-xs"
          >
            {/* Header */}
            <div className="bg-[#0b2217] p-4 border-b border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold text-lg">
                  🐥
                </div>
                <div>
                  <div className="font-serif font-black text-amber-300 text-sm flex items-center gap-1.5">
                    ChickMagnet Assistant
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online • Bio-Security & Support
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-emerald-900 text-emerald-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Topic Buttons Carousel */}
            <div className="p-2.5 bg-[#0b2217]/50 border-b border-emerald-800/60 overflow-x-auto flex gap-1.5 scrollbar-none">
              {quickTopics.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSendMessage(t.query)}
                  className="bg-[#123524] hover:bg-emerald-900 border border-emerald-700/80 text-amber-200 px-2.5 py-1.5 rounded-xl whitespace-nowrap text-[10px] font-bold transition-all cursor-pointer shrink-0"
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 space-y-2 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-amber-400 text-emerald-950 font-medium rounded-tr-xs'
                        : 'bg-[#0b2217] border border-emerald-800 text-emerald-100 rounded-tl-xs'
                    }`}
                  >
                    <div>{msg.text}</div>

                    {msg.action && (
                      <button
                        onClick={() => handleActionClick(msg.action!.type)}
                        className="mt-1 w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 py-1.5 px-3 rounded-xl font-bold font-mono text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>{msg.action.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] text-emerald-400/70 font-mono mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 bg-[#0b2217] text-emerald-300 p-2.5 rounded-2xl rounded-tl-xs w-20 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce delay-300"></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-[#0b2217] border-t border-emerald-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about breeds, vaccines or delivery..."
                  className="flex-1 bg-[#123524] border border-emerald-700/80 rounded-xl px-3 py-2 text-white placeholder-emerald-400/60 focus:outline-none focus:border-amber-400 text-xs"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    inputMessage.trim()
                      ? 'bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold'
                      : 'bg-emerald-900 text-emerald-600 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
