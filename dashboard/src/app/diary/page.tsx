'use client';

import { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { useAuth } from '@/context/auth-context';
import { useVault } from '@/hooks/use-vault';
import { useLanguage } from '@/lib/i18n-context';
import { VaultModal } from '@/components/vault/vault-modal';
import { Lock, Unlock, Calendar, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlurFade } from '@/components/ui/blur-fade';
import { MoodComposer } from '@/components/diary/mood-composer';
import { AnalysisWidget } from '@/components/diary/analysis-widget';
import { SleepChart } from '@/components/diary/sleep-chart';

const fetcher = ([url, token]: [string, string]) =>
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.data);

export default function DiaryPage() {
    const { token } = useAuth();
    const { t } = useLanguage();
    const { unlock, decrypt: decryptVault } = useVault();
    const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
    const [selectedEncryptedLog, setSelectedEncryptedLog] = useState<any>(null);
    const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});

    const { data: history, error, mutate } = useSWR(token ? ['/api/history', token] : null, fetcher);

    const handleUnlockRequest = (log: any) => {
        setSelectedEncryptedLog(log);
        setIsVaultModalOpen(true);
    };

    const handleVaultUnlock = async (password: string) => {
        const success = await unlock(password);
        if (success && selectedEncryptedLog) {
            try {
                const result = await decryptVault(
                    selectedEncryptedLog.note,
                    selectedEncryptedLog.iv,
                    selectedEncryptedLog.salt
                );

                if (result) {
                    setDecryptedCache(prev => ({ ...prev, [selectedEncryptedLog.id]: result }));
                    setIsVaultModalOpen(false);
                    setSelectedEncryptedLog(null);
                }
            } catch (e) {
                console.error("Decryption failed", e);
                alert("Failed to decrypt note. Is the password correct?");
            }
        }
    };

    const handleCommit = () => {
        mutate();
    };

    if (error) return <div className="text-red-500 p-8">{t('diary.error')}</div>;
    if (!history) return <div className="text-white p-8">{t('diary.loading')}</div>;

    return (
        <div className="min-h-screen bg-black text-white p-6 pt-24 max-w-4xl mx-auto">
            <VaultModal
                isOpen={isVaultModalOpen}
                onClose={() => setIsVaultModalOpen(false)}
                onUnlock={handleVaultUnlock}
                isUnlocked={false} // TODO: No hay contexto valido en produccion esto deberia cambiar
            />

            <header className="mb-12">
                <h1 className="text-4xl font-bold font-heading tracking-tight mb-2 flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-neutral-500" />
                    {t('diary.title')}
                </h1>
                <p className="text-neutral-400">{t('diary.desc')}</p>
            </header>

            <div className="mb-12">
                <BlurFade delay={0.1}>
                    <MoodComposer onCommit={handleCommit} className="border-neutral-800" compact />
                </BlurFade>
            </div>

            <BlurFade delay={0.15}>
                <AnalysisWidget history={history} decryptedCache={decryptedCache} />
            </BlurFade>

            <BlurFade delay={0.2}>
                <SleepChart />
            </BlurFade>

            <div className="space-y-6">
                {history.map((log: any, idx: number) => {
                    const isVault = log.is_vault;
                    const isDecrypted = decryptedCache[log.id];

                    return (
                        <BlurFade delay={idx * 0.05} key={log.id}>
                            <div className={cn(
                                "p-6 rounded-xl border transition-all duration-300 relative overflow-hidden group",
                                isVault
                                    ? (isDecrypted ? "bg-red-950/20 border-red-900/50" : "bg-neutral-900/50 border-red-900/30 hover:border-red-500/50 cursor-pointer")
                                    : "bg-neutral-900/30 border-white/10"
                            )}
                                onClick={() => {
                                    if (isVault && !isDecrypted) handleUnlockRequest(log);
                                }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg",
                                            log.score >= 8 ? "bg-green-500/20 text-green-500" :
                                                log.score <= 4 ? "bg-red-500/20 text-red-500" :
                                                    "bg-yellow-500/20 text-yellow-500"
                                        )}>
                                            {log.score}
                                        </div>
                                        <div>
                                            <div className="text-sm text-neutral-500 font-mono">
                                                {new Date(log.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-neutral-600">
                                                {new Date(log.created_at).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                    {isVault && (
                                        <div className="text-red-500">
                                            {isDecrypted ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                        </div>
                                    )}
                                </div>

                                <div className="font-mono text-sm leading-relaxed text-neutral-300">
                                    {isVault ? (
                                        isDecrypted ? (
                                            <span className="text-red-200 animate-in fade-in duration-500">{isDecrypted}</span>
                                        ) : (
                                            <div className="flex items-center gap-2 text-red-900 opacity-50 select-none blur-[2px] group-hover:blur-0 transition-all">
                                                <ShieldCheck className="w-4 h-4" />
                                                {t('diary.encrypted')}
                                            </div>
                                        )
                                    ) : (
                                        log.note || <span className="text-neutral-600 italic">{t('diary.no_notes')}</span>
                                    )}
                                </div>
                            </div>
                        </BlurFade>
                    );
                })}
            </div>
        </div>
    );
}
