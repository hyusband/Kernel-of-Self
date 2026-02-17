'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { MoodSlider } from '@/components/ui/mood-slider';
import { Activity, ArrowRight, Lock, Unlock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n-context';
import { useVault } from '@/hooks/use-vault';
import { useAuth } from '@/context/auth-context';
import { VaultModal } from '@/components/vault/vault-modal';
import { cn } from '@/lib/utils';

interface MoodComposerProps {
    onCommit?: () => void;
    className?: string;
    compact?: boolean;
}

export function MoodComposer({ onCommit, className, compact = false }: MoodComposerProps) {
    const { t } = useLanguage();
    const { isUnlocked, unlock, lock, encrypt } = useVault();
    const { token } = useAuth();

    const [mood, setMood] = useState(5);
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        setIsOffline(!navigator.onLine);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleVaultToggle = () => {
        if (isUnlocked) {
            lock();
        } else {
            setIsVaultModalOpen(true);
        }
    };

    const handleVaultUnlock = async (password: string) => {
        const success = await unlock(password);
        if (success) {
            setIsVaultModalOpen(false);
        }
    };

    const handleSubmit = async () => {
        if (!token) return;
        setIsSubmitting(true);
        try {
            let payload: any = { score: mood, note };

            if (isUnlocked) {
                const encrypted = await encrypt(note);
                payload = {
                    score: mood,
                    note: encrypted.cipher,
                    iv: encrypted.iv,
                    salt: encrypted.salt,
                    is_encrypted: true
                };
            }

            if (isOffline) {
                const pending = JSON.parse(localStorage.getItem('pending_logs') || '[]');
                pending.push({ ...payload, timestamp: Date.now() });
                localStorage.setItem('pending_logs', JSON.stringify(pending));
                alert(t('input.syncq'));
                setNote('');
            } else {
                await axios.post('/api/mood', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNote('');
                if (onCommit) onCommit();
            }
        } catch (err) {
            console.error(err);
            alert('Failed to commit log.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <VaultModal
                isOpen={isVaultModalOpen}
                onClose={() => setIsVaultModalOpen(false)}
                onUnlock={handleVaultUnlock}
                isUnlocked={isUnlocked}
            />

            <SpotlightCard className={cn(
                "p-8 space-y-8 transition-colors duration-500",
                isUnlocked ? "border-red-900/50 bg-black shadow-[0_0_30px_rgba(220,38,38,0.1)]" : "",
                className
            )}>
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-sm font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                            {t('input.title')}
                            {isUnlocked && <span className="text-xs text-red-500 animate-pulse font-bold tracking-widest">ENCRYPTED</span>}
                        </h2>

                        {/* Integrated Vault Toggle */}
                        <button
                            onClick={handleVaultToggle}
                            className={cn(
                                "p-1.5 rounded-full transition-all duration-300 border",
                                isUnlocked
                                    ? "text-red-500 border-red-900/50 bg-red-950/20 hover:bg-red-900/40"
                                    : "text-neutral-500 border-transparent hover:border-neutral-700 hover:text-neutral-300"
                            )}
                            title={isUnlocked ? "Lock Vault" : "Unlock Vault to Encrypt"}
                        >
                            {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                    </div>

                    <MoodSlider value={mood} onChange={setMood} />
                    <div className="flex justify-between text-xs text-neutral-600 mt-2 font-mono px-2">
                        <span>{t('input.labels.crit')}</span>
                        <span>{t('input.labels.stable')}</span>
                        <span>{t('input.labels.peak')}</span>
                    </div>
                </div>

                <div className="space-y-2 relative">
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={isUnlocked ? "Enter classified data. Local encryption active..." : t('input.placeholder')}
                        className={cn(
                            "w-full bg-neutral-950/50 border rounded-lg p-4 text-sm text-white focus:outline-none transition-all resize-none leading-relaxed",
                            compact ? "h-24" : "h-32",
                            isUnlocked
                                ? "border-red-900/50 placeholder:text-red-900/50 focus:border-red-500 focus:ring-1 focus:ring-red-900 font-mono text-red-200"
                                : "border-neutral-800 placeholder:text-neutral-700 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
                        )}
                    />
                    {isUnlocked && (
                        <div className="absolute top-2 right-2">
                            <ShieldCheck className="w-3 h-3 text-red-500/50" />
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={cn(
                        "group w-full h-12 font-medium rounded-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 overflow-hidden relative",
                        isUnlocked
                            ? "bg-red-600 text-white hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                            : "bg-white text-black hover:bg-neutral-200"
                    )}
                >
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-r from-transparent to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700",
                        isUnlocked ? "via-red-400/50" : "via-white/50"
                    )} />
                    {isSubmitting ? <Activity className="w-4 h-4 animate-spin" /> : <span>{isUnlocked ? "SECURE COMMIT" : t('input.submit')}</span>}
                    {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
            </SpotlightCard>
        </>
    );
}
