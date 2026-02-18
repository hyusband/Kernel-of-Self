'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import api from '@/lib/axios';
import { useAuth } from '@/context/auth-context';
import { useVault } from '@/hooks/use-vault';
import { useLanguage } from '@/lib/i18n-context';
import { VaultModal } from '@/components/vault/vault-modal';
import { Lock, Unlock, Calendar, ShieldCheck, Activity, Brain, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlurFade } from '@/components/ui/blur-fade';
import { MoodComposer } from '@/components/diary/mood-composer';
import { AnalysisWidget } from '@/components/diary/analysis-widget';
import { SleepChart } from '@/components/diary/sleep-chart';
import { SpotlightCard } from '@/components/ui/spotlight-card';

const fetcher = ([url, token]: [string, string]) =>
    api.get(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.data);

export default function DiaryPage() {
    const { token } = useAuth();
    const { t } = useLanguage();
    const { unlock, decrypt: decryptVault } = useVault();
    const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
    const [selectedEncryptedLog, setSelectedEncryptedLog] = useState<any>(null);
    const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});

    const { data: history, error, mutate } = useSWR(token ? ['/api/history', token] : null, fetcher);

    const stats = useMemo(() => {
        if (!history) return null;
        const total = history.length;
        const avgMood = history.reduce((acc: number, log: any) => acc + log.score, 0) / total || 0;
        const lastMood = history[0]?.score || 0;
        return { total, avgMood: avgMood.toFixed(1), lastMood };
    }, [history]);

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
        <div className="min-h-screen bg-black text-white p-6 pt-24 max-w-7xl mx-auto space-y-8">
            <VaultModal
                isOpen={isVaultModalOpen}
                onClose={() => setIsVaultModalOpen(false)}
                onUnlock={handleVaultUnlock}
                isUnlocked={false}
            />

            {/* Application Header & KPI Cards */}
            <header className="flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-bold font-heading tracking-tight mb-2 flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-neutral-500" />
                        {t('diary.title')}
                    </h1>
                    <p className="text-neutral-400 max-w-md">{t('diary.desc')}</p>
                </div>

                {stats && (
                    <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
                        <SpotlightCard className="bg-neutral-900/10 border-white/5 p-4 min-w-[120px]">
                            <div className="flex items-center gap-2 text-neutral-500 mb-1 text-xs uppercase tracking-widest font-mono">
                                <Activity className="w-3 h-3" /> Entries
                            </div>
                            <div className="text-2xl font-bold font-heading">{stats.total}</div>
                        </SpotlightCard>
                        <SpotlightCard className="bg-neutral-900/10 border-white/5 p-4 min-w-[120px]">
                            <div className="flex items-center gap-2 text-neutral-500 mb-1 text-xs uppercase tracking-widest font-mono">
                                <TrendingUp className="w-3 h-3" /> Avg Mood
                            </div>
                            <div className="text-2xl font-bold font-heading">{stats.avgMood}</div>
                        </SpotlightCard>
                        <SpotlightCard className="bg-neutral-900/10 border-white/5 p-4 min-w-[120px]">
                            <div className="flex items-center gap-2 text-neutral-500 mb-1 text-xs uppercase tracking-widest font-mono">
                                <Brain className="w-3 h-3" /> Latest
                            </div>
                            <div className={cn("text-2xl font-bold font-heading",
                                stats.lastMood >= 8 ? "text-green-500" :
                                    stats.lastMood <= 4 ? "text-red-500" : "text-yellow-500"
                            )}>{stats.lastMood}</div>
                        </SpotlightCard>
                    </div>
                )}
            </header>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Input & Actions (Sticky on Desktop) */}
                <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-8 h-fit">
                    <BlurFade delay={0.1}>
                        <div className="bg-neutral-900/10 border border-white/5 rounded-2xl p-1">
                            <MoodComposer onCommit={handleCommit} className="border-0 shadow-none bg-transparent" compact={false} />
                        </div>
                    </BlurFade>

                    <div className="hidden lg:block p-6 rounded-2xl bg-neutral-900/20 border border-white/5 text-sm text-neutral-500">
                        <p className="mb-2 font-bold text-neutral-400">💡 Pro Tip</p>
                        <p>Consistent logging improves the AI's ability to detect patterns in your sleep and mood cycles.</p>
                    </div>
                </div>

                {/* Right Column: Analysis & History */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Analytics Section */}
                    <div className="space-y-6">
                        <BlurFade delay={0.15} className="w-full">
                            <AnalysisWidget history={history} decryptedCache={decryptedCache} />
                        </BlurFade>
                        <BlurFade delay={0.2} className="w-full">
                            <SleepChart />
                        </BlurFade>
                    </div>

                    {/* History Feed */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold font-heading flex items-center gap-2 mb-6">
                            <Activity className="w-5 h-5 text-neutral-500" />
                            Recent Logs
                        </h3>

                        {history.map((log: any, idx: number) => {
                            const isVault = log.is_vault;
                            const isDecrypted = decryptedCache[log.id];

                            return (
                                <BlurFade delay={idx * 0.05} key={log.id}>
                                    <div className={cn(
                                        "p-6 rounded-xl border transition-all duration-300 relative overflow-hidden group bg-neutral-900/20 hover:bg-neutral-900/40",
                                        isVault
                                            ? (isDecrypted ? "border-red-900/50" : "border-red-900/30 hover:border-red-500/50 cursor-pointer")
                                            : "border-white/5 hover:border-white/10"
                                    )}
                                        onClick={() => {
                                            if (isVault && !isDecrypted) handleUnlockRequest(log);
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner",
                                                    log.score >= 8 ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                                                        log.score <= 4 ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                                            "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                                )}>
                                                    {log.score}
                                                </div>
                                                <div>
                                                    <div className="text-sm text-neutral-400 font-medium">
                                                        {new Date(log.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </div>
                                                    <div className="text-xs text-neutral-600 font-mono mt-0.5">
                                                        {new Date(log.created_at).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </div>
                                            {isVault && (
                                                <div className="text-red-500 bg-red-950/30 p-2 rounded-lg">
                                                    {isDecrypted ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                </div>
                                            )}
                                        </div>

                                        <div className="font-mono text-sm leading-relaxed text-neutral-300 pl-16">
                                            {isVault ? (
                                                isDecrypted ? (
                                                    <span className="text-red-200 animate-in fade-in duration-500">{isDecrypted}</span>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-red-900/60 select-none blur-[2px] group-hover:blur-sm transition-all">
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
            </div>
        </div>
    );
}
