import React, { useState, useEffect, useRef } from 'react';
import { MessageSquareText, Send, User, Globe, Loader2 } from 'lucide-react';
import { ChatMessage } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const SYSTEM_PROMPT = `你是一个农业育秧专家，请以专业、简明、友好的方式回答用户关于育秧、育苗、温室管理、营养调控、病虫害防治等方面的问题。`;

export function FeedbackView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '您好，我是您的农业育秧专家。请告诉我您的问题，我将为您提供专业建议。',
    },
  ]);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setContent('');
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessage.content, history: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error(`Chat API 请求失败: ${response.statusText}`);
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.reply || '很抱歉，未能获得回复，请稍后再试。',
        },
      ]);
    } catch (err) {
      console.error('Failed to send chat message:', err);
      setError('与 AI 对话服务连接失败，请稍后重试。');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquareText className="w-6 h-6 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">AI 农业育秧专家</h2>
            <p className="text-sm text-gray-400">和专家对话，获取育秧建议与温室管理方案。</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <Globe className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">AI Chat</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded-3xl p-5 border transition-all',
                msg.role === 'assistant'
                  ? 'bg-[#11151C] border-blue-500/20'
                  : 'bg-[#171D25] border-white/10 self-end'
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', msg.role === 'assistant' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/10 text-gray-300')}>
                  <User className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
                  {msg.role === 'assistant' ? '专家' : '我'}
                </span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="pt-4 border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="向农业育秧专家提问，例如：如何优化水稻育苗温度方案？"
            className="w-full bg-[#161B26] border border-white/10 rounded-2xl p-5 pr-16 text-sm text-white focus:outline-none focus:border-blue-500 transition-all min-h-[110px] resize-none custom-scrollbar"
          />
          <button
            type="submit"
            disabled={!content.trim() || isSending}
            className="absolute bottom-4 right-4 p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}