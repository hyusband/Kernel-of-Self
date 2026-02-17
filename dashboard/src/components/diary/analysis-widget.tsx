'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/lib/i18n-context';
import { Sparkles, BrainCircuit, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlurFade } from '@/components/ui/blur-fade';

interface Log {
    id: number;
    created_at: string;
    score: number;
    note: string;
    is_vault: boolean;
}

interface AnalysisWidgetProps {
    history: Log[];
    decryptedCache: Record<string, string>;
}

export function AnalysisWidget({ history, decryptedCache }: AnalysisWidgetProps) {
    const { token } = useAuth();
    const { t, language } = useLanguage();
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'resilience' | 'truth'>('resilience');

    const handleAnalyze = async () => {
        if (!token) return;
        setIsLoading(true);
        try {

            const entries = history.slice(0, 10).map(log => {
                let content = log.note;
                if (log.is_vault) {
                    if (decryptedCache[log.id]) {
                        content = decryptedCache[log.id];
                    } else {
                        return null;
                    }
                }
                return {
                    date: new Date(log.created_at).toLocaleDateString(),
                    score: log.score,
                    content
                };
            }).filter(Boolean); // Remove nulls

            if (entries.length === 0) {
                alert("No visible entries to analyze. Unlock vault entries first.");
                setIsLoading(false);
                return;
            }

            const res = await axios.post('/api/analyze', {
                entries,
                locale: language
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setAnalysis(res.data.analysis);

        } catch (error) {
            console.error(error);
            alert("Analysis failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn(
            "bg-neutral-900/30 border rounded-xl p-6 mb-8 relative overflow-hidden transition-all duration-500",
            mode === 'truth' ? "border-red-900/30 shadow-[0_0_30px_-10px_rgba(220,38,38,0.2)]" : "border-white/10"
        )}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h3 className="text-xl font-heading font-bold flex items-center gap-2 text-white">
                    <BrainCircuit className="w-5 h-5 text-purple-400" />
                    {language === 'es' ? 'Análisis Cognitivo' : 'Cognitive Analysis'}
                </h3>

                <div className="flex items-center gap-3">
                    <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                        <button
                            onClick={() => setMode('resilience')}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-mono transition-all",
                                mode === 'resilience' ? "bg-neutral-800 text-purple-400" : "text-neutral-500 hover:text-neutral-300"
                            )}
                        >
                            {language === 'es' ? 'RESILIENCIA' : 'RESILIENCE'}
                        </button>
                        <button
                            onClick={() => setMode('truth')}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-mono transition-all",
                                mode === 'truth' ? "bg-red-900/30 text-red-500" : "text-neutral-500 hover:text-neutral-300"
                            )}
                        >
                            {language === 'es' ? 'DETECTOR DE MENTIRAS' : 'LIE DETECTOR'}
                        </button>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs transition-all",
                            isLoading ? "bg-neutral-800 text-neutral-500" : "bg-purple-900/20 text-purple-400 hover:bg-purple-900/40 border border-purple-500/30",
                            mode === 'truth' && !isLoading && "bg-red-900/20 text-red-500 border-red-500/30 hover:bg-red-900/40"
                        )}
                    >
                        {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        {language === 'es' ? 'ANALIZAR' : 'ANALYZE'}
                    </button>
                </div>
            </div>

            {analysis && (
                <BlurFade>
                    <div className="prose prose-invert prose-sm max-w-none font-mono">
                        <div className="whitespace-pre-wrap text-neutral-300 leading-relaxed bg-black/50 p-4 rounded-lg border border-purple-500/20">
                            {analysis}
                        </div>
                    </div>
                </BlurFade>
            )}

            {!analysis && !isLoading && (
                <p className="text-sm text-neutral-500 font-mono italic">
                    {language === 'es'
                        ? "Desbloquea entradas del Vault para incluirlas en el análisis."
                        : "Unlock Vault entries to include them in the analysis."}
                </p>
            )}
        </div>
    );
}
