import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, ShieldCheck, Truck, HelpCircle, FileText, ArrowRight, Sparkles, RefreshCw, PhoneCall } from 'lucide-react';
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
      text: 'Hello! I am your ChickMagnet Hatchery & Logistics Assistant. How can I help you today?',
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
      id: 'transit',
      label: '🐥 Live Chick Transit',
      query: 'How does live day-old chick climate transit work?',
      reply: 'Day-old chicks travel in climate-stabilized, temperature-monitored vehicles equipped with ventilation crates. Dispatch runs every Tuesday, Thursday, and Saturday. Minimum order is 10 chicks per breed to ensure body heat preservation during transit.'
    },
    {
      id: 'guarantee',
      label: '🚑 24h Mortality Guarantee',
      query: 'What is the 24-Hour Arrival Guarantee?',
      reply: 'All live bird shipments are covered by our 24-Hour Arrival Guarantee. If any chick arrives unviable, upload a quick photo in our resolution portal within 24 hours of delivery for instant store credit or refund.',
      action: {
        label: 'File Mortality Claim Now',
        type: 'open_claims' as const
      }
    },
    {
      id: 'traceability',
      label: '🔍 Batch ID Traceability',
      query: 'How do I trace my poultry batch ID?',
      reply: 'Every box of chicks, hatching eggs, or dressed poultry carries a QR & Batch ID (e.g., BATCH-2026-CHX9). Use our portal to view parent flock vaccination logs, hatch dates, and lab bio-security clearance certificates.',
      action: {
        label: 'Open Traceability Portal',
        type: 'open_traceability' as const
      }
    },
    {
      id: 'wholesale',
      label: '🏢 Wholesale Net-30 Terms',
      query: 'How do commercial farms get Net-30 credit terms?',
      reply: 'Commercial buyers and institutions with a tax PIN and farm registration can apply for Net-30 credit terms up to Ksh 500,000. Orders ship immediately with PO references.',
      action: {
        label: 'Apply for Wholesale Credit',
        type: 'open_wholesale' as const
      }
    },
    {
      id: 'weight',
      label: 'Scale Weight Holds',
      query: 'How do scale weight pre-authorizations work for fresh meat?',
      reply: 'Whole dressed broilers and fresh cuts vary slightly in weight at packing. We pre-authorize a +10% maximum cushion and automatically adjust your final card/M-Pesa bill downward to match actual scale-weighed packed poultry.'
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
      let botReplyText = "Thanks for asking! Our hatchery team operates 24/7. You can browse our NPIP-certified catalog or trace batch records anytime using the portal controls.";
      let botAction = actionObj;

      const lower = text.toLowerCase();
      if (lower.includes('chick') || lower.includes('transit') || lower.includes('shipping') || lower.includes('live')) {
        botReplyText = "Live chicks are transported in climate-controlled vans running Tue/Thu/Sat. Heat preservation requires a minimum of 10 chicks per breed.";
      } else if (lower.includes('claim') || lower.includes('dead') || lower.includes('die') || lower.includes('mortality') || lower.includes('guarantee')) {
        botReplyText = "Our 24-Hour Live Arrival Guarantee covers all chick orders. You can submit a photo evidence claim directly in your order portal for instant credit.";
        botAction = { label: 'Open 24h Claim Portal', type: 'open_claims' };
      } else if (lower.includes('trace') || lower.includes('batch') || lower.includes('vaccin') || lower.includes('health')) {
        botReplyText = "Every batch has full bio-security lineage including Mareks, Newcastle, and Gumboro vaccination logs. Try searching Batch ID: BATCH-2026-CHX9.";
        botAction = { label: 'Open Traceability Portal', type: 'open_traceability' };
      } else if (lower.includes('wholesale') || lower.includes('net30') || lower.includes('credit') || lower.includes('po')) {
        botReplyText = "Wholesale Net-30 terms are available for commercial poultry farms and food distributors with instant credit limits up to Ksh 500,000.";
        botAction = { label: 'Explore Wholesale Portal', type: 'open_wholesale' };
      } else if (lower.includes('pay') || lower.includes('mpesa') || lower.includes('card') || lower.includes('weight')) {
        botReplyText = "We accept M-Pesa Mobile Money, Visa, Mastercard, and Net-30 Invoices. Scale-weighed packed items are pre-authorized with a +10% cushion and auto-adjusted to exact packed weight.";
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
                  onClick={() => handleSendMessage(t.query, t.action)}
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
                  placeholder="Ask about chicks, health logs, shipping..."
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
