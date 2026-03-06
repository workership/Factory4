import React, { useState, useEffect, useRef } from 'react';
import { MessageSquareText, Send, User, Globe, ShieldCheck, Loader2 } from 'lucide-react';
import { FeedbackMessage } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function FeedbackView() {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setContent('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquareText className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-white tracking-tight">匿名留言板</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <Globe className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Public Access</span>
        </div>
      </div>

      {/* Message List - "Infinite Bowl" style */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 flex flex-col-reverse">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 space-y-4">
            <MessageSquareText className="w-16 h-16" />
            <p className="text-sm font-bold uppercase tracking-widest">暂无留言，虚位以待</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#161B26] border border-white/5 rounded-2xl p-5 space-y-3 hover:border-blue-500/20 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white tracking-wider">ID: {msg.hash}</span>
                        {msg.hasTask && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase">已提交任务</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-600 font-mono">IP: {msg.ip}</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{msg.timestamp}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed pl-11">
                  {msg.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Input Area */}
      <div className="pt-4 border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="在此输入您的留言..."
            className="w-full bg-[#161B26] border border-white/10 rounded-2xl p-5 pr-16 text-sm text-white focus:outline-none focus:border-blue-500 transition-all min-h-[100px] resize-none custom-scrollbar"
          />
          <button
            type="submit"
            disabled={!content.trim() || isSending}
            className="absolute bottom-4 right-4 p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <p className="text-[9px] text-gray-600 mt-3 text-center uppercase font-bold tracking-[0.2em]">
          匿名留言系统 · 您的 IP 地址将被哈希处理以保护隐私
        </p>
      </div>
    </div>
  );
}
