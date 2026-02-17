"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Key, ShieldCheck, X } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';

interface VaultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUnlock: (password: string) => void;
    isUnlocked: boolean;
}

export function VaultModal({ isOpen, onClose, onUnlock, isUnlocked }: VaultModalProps) {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUnlock(password);
        setPassword('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl relative"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-neutral-800 bg-neutral-900/50">
                        <div className="flex items-center gap-2 text-neutral-200">
                            {isUnlocked ? <Unlock className="w-5 h-5 text-green-500" /> : <Lock className="w-5 h-5 text-red-500" />}
                            <h2 className="font-mono font-bold tracking-wider">THE VAULT</h2>
                        </div>
                        <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {!isUnlocked ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <p className="text-sm text-neutral-400 font-mono">
                                    Zero-Knowledge Encryption Active.<br />
                                    Enter your session key to decrypt/encrypt logs.
                                </p>

                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Key className="h-4 w-4 text-neutral-500 group-focus-within:text-red-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 bg-black/50 border border-neutral-700 rounded-lg py-3 text-white placeholder-neutral-600 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm font-mono tracking-widest"
                                        placeholder="ENTER_PASSPHRASE"
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-white hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all"
                                >
                                    INITIALIZE SESSION
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8 space-y-4">
                                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                    <ShieldCheck className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Session Active</h3>
                                <p className="text-neutral-400 text-sm max-w-xs mx-auto">
                                    Your logs will be encrypted locally with AES-GCM before transmission.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="mt-4 px-6 py-2 border border-green-500/50 text-green-500 rounded hover:bg-green-500/10 transition-colors font-mono text-sm"
                                >
                                    PROCEED
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer Decor */}
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-20" />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
