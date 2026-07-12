import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquareCode, 
  Send, 
  Trash2, 
  Sparkles, 
  User, 
  Bot, 
  Loader2, 
  Lightbulb, 
  Terminal,
  Eraser,
  HelpCircle,
  Clock
} from 'lucide-react';
import { ChatMessage } from '../types';

interface AssistantChatProps {
  chatHistory: ChatMessage[];
  loading: boolean;
  onSendMessage: (message: string) => Promise<any>;
  onClearHistory: () => Promise<boolean>;
  addToast: (title: string, content: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

// Light and custom compile-safe inline Markdown parser for robust styled text rendering
function parseMarkdownToHtml(text: string) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    let content = line;
    
    // Check headings
    if (content.startsWith('### ')) {
      return <h4 key={idx} className="text-xs font-bold text-indigo-400 mt-2 mb-1 uppercase tracking-wider">{content.replace('### ', '')}</h4>;
    }
    if (content.startsWith('## ')) {
      return <h3 key={idx} className="text-sm font-extrabold text-white mt-3 mb-1.5 font-sans">{content.replace('## ', '')}</h3>;
    }
    if (content.startsWith('# ')) {
      return <h2 key={idx} className="text-base font-black text-white mt-4 mb-2 border-b border-slate-800 pb-1">{content.replace('# ', '')}</h2>;
    }
    
    // Check bullets
    if (content.startsWith('- ') || content.startsWith('* ')) {
      const cleanBullet = content.replace(/^[-*]\s+/, '');
      return (
        <ul key={idx} className="list-disc pl-4 space-y-0.5 text-xs text-slate-300">
          <li>{parseInlineFormatting(cleanBullet)}</li>
        </ul>
      );
    }
    
    // Check numbered list
    if (/^\d+\.\s+/.test(content)) {
      const cleanNum = content.replace(/^\d+\.\s+/, '');
      return (
        <ol key={idx} className="list-decimal pl-4 space-y-0.5 text-xs text-slate-300">
          <li>{parseInlineFormatting(cleanNum)}</li>
        </ol>
      );
    }

    // Default paragraph
    return <p key={idx} className="text-xs leading-relaxed text-slate-300 mb-1.5">{parseInlineFormatting(content)}</p>;
  });
}

function parseInlineFormatting(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-white bg-slate-800/40 px-1 rounded">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-slate-100">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 font-mono text-[10px] bg-indigo-950/60 text-indigo-400 border border-indigo-500/20 rounded">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

export default function AssistantChat({
  chatHistory,
  loading,
  onSendMessage,
  onClearHistory,
  addToast
}: AssistantChatProps) {
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chats
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, submitting]);

  // Prompt helper chips list
  const helperChips = [
    { label: 'Draft Interview Scorecard', prompt: 'Draft a standard candidate technical interview evaluation scorecard for a Senior DevOps engineer with sections for AWS, K8s, and Terraform.' },
    { label: 'Pitch Apex Tech', prompt: 'Based on Apex Global Technologies (large SaaS company), draft a custom, professional, multi-channel recruitment outreach email pitching executive search services.' },
    { label: 'Cloud Skills Gap Plan', prompt: 'Analyze candidate technical skills gaps for AWS cloud roles and recommend a study roadmap with structured learning milestones.' },
    { label: 'Junior Dev Offer Letter', prompt: 'Generate an enterprise-grade job offer letter template for a Fullstack React Developer including placeholders for salary, benefits, and joining dates.' }
  ];

  const handleSend = async (messageText: string) => {
    if (!messageText.trim()) return;
    setSubmitting(true);
    setInput('');
    
    try {
      await onSendMessage(messageText);
    } catch (err: any) {
      addToast('Completion Failed', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Clear entire recruitment agent conversation history?')) {
      try {
        await onClearHistory();
        addToast('Conversation Reset', 'Message registers cleared', 'success');
      } catch (err: any) {
        addToast('Action Failed', err.message, 'error');
      }
    }
  };

  return (
    <div className="p-6 space-y-6 flex flex-col h-[calc(100vh-40px)]">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/10 shadow-sm">
            <MessageSquareCode size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold font-sans text-slate-900 dark:text-white tracking-tight">AI Recruitment Companion</h1>
            <p className="text-xs text-slate-500">Gemini-driven sourcing strategies, interview scorecards, and campaign planners.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-red-500 hover:bg-red-500/10 transition-all duration-150 cursor-pointer"
            title="Clear Chat Logs"
          >
            <Eraser size={14} />
            <span>Reset Feed</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Conversation bubble feed and quick chips column */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0 overflow-hidden">
        
        {/* Left Columns (3 span): Active Messages Log */}
        <div className="lg:col-span-3 flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm">
          
          {/* Chat scrolling feed */}
          <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-4">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow">
                  <Bot size={24} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-950 dark:text-slate-100 font-sans">Corporate Agent Active</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">Converse about active client-acquisition pipelines, candidate sourcing credentials, or template generations.</p>
                </div>
              </div>
            ) : (
              chatHistory.map((chat) => {
                const isAI = chat.role === 'model';
                return (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 max-w-[85%] ${isAI ? '' : 'ml-auto flex-row-reverse'}`}
                  >
                    {/* Role Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 shadow-sm ${
                      isAI 
                        ? 'bg-gradient-to-tr from-indigo-500 to-violet-600 text-white border-indigo-500/20' 
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}>
                      {isAI ? <Bot size={14} /> : <User size={14} />}
                    </div>

                    {/* Content Box */}
                    <div className={`p-4 rounded-2xl border text-xs shadow-sm leading-relaxed ${
                      isAI 
                        ? 'bg-slate-950 text-slate-100 border-slate-850' 
                        : 'bg-indigo-600 text-white border-indigo-600 font-medium'
                    }`}>
                      {isAI ? (
                        <div className="space-y-1.5">
                          {parseMarkdownToHtml(chat.text || '')}
                        </div>
                      ) : (
                        <p className="font-sans whitespace-pre-wrap">{chat.text}</p>
                      )}
                      <span className={`block text-[8px] font-mono mt-2 text-right ${isAI ? 'text-slate-500' : 'text-indigo-200'}`}>
                        {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* AI typing state bubble */}
            {submitting && (
              <div className="flex items-start gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center border border-indigo-500/20 shrink-0">
                  <Bot size={14} className="animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-slate-400 text-xs flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Gemini is compiling recommendations...</span>
                </div>
              </div>
            )}
            
            <div ref={chatBottomRef} />
          </div>

          {/* Chat input form container */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-1.5 focus-within:ring-1 focus-within:ring-indigo-500"
            >
              <Terminal size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Ask recruitment companion anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={submitting}
                className="flex-1 bg-transparent border-none text-xs focus:outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={submitting || !input.trim()}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white cursor-pointer transition-colors"
              >
                <Send size={12} />
              </button>
            </form>
          </div>

        </div>

        {/* Right Column (1 span): Prompt Helper Panel */}
        <div className="space-y-4">
          <div className="p-5 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 shrink-0">
              <Lightbulb className="text-indigo-500" size={16} />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest font-mono">Quick Ingress Chips</h3>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed shrink-0">Submit specialized queries to the Gemini platform instantly by tapping any card template below.</p>
            
            <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-1">
              {helperChips.map(chip => (
                <button
                  key={chip.label}
                  onClick={() => handleSend(chip.prompt)}
                  disabled={submitting}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-indigo-500/5 hover:border-indigo-500/20 text-xs transition-all duration-150 group"
                >
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-500 truncate">{chip.label}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 mt-1 leading-relaxed">"{chip.prompt}"</p>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono shrink-0">
              <Clock size={12} />
              <span>SYSTEM CHAT LOGGED</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
