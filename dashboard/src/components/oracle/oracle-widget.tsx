"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

import { useLanguage } from '@/lib/i18n-context';

import { useAuth } from '@/context/auth-context';

export const OracleWidget = () => {
    const { t } = useLanguage();
    const { token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ role: 'assistant', content: t('oracle.greeting') }]);
        }
    }, [t, messages.length]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !token) return;

        const userMsg = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));

            const res = await api.post('/api/chat', {
                message: userMsg.content,
                history: historyPayload
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const botMsg = { role: 'assistant' as const, content: res.data.reply };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: t('oracle.error') }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="pointer-events-auto w-[350px] md:w-[400px] h-[500px] bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span className="font-heading font-bold text-white tracking-widest text-sm">{t('oracle.title')}</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                        msg.role === 'assistant' ? "bg-purple-900/50 text-purple-200" : "bg-neutral-800 text-neutral-200"
                                    )}>
                                        {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-lg text-sm max-w-[80%] leading-relaxed",
                                        msg.role === 'assistant' ? "bg-white/5 text-purple-100 border border-purple-500/20" : "bg-neutral-800 text-white"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center shrink-0 animate-pulse">
                                        <Bot className="w-4 h-4 text-purple-200" />
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg text-sm text-purple-200/50 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" />
                                        <span className="ml-2 text-xs text-purple-300">{t('oracle.loading')}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10 bg-black/50">
                            <div className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={t('oracle.placeholder')}
                                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-neutral-600"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="pointer-events-auto w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all z-50 border border-purple-400/50"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </motion.button>
        </div>
    );
};
