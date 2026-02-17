'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/lib/i18n-context';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { Moon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SleepData {
    id: number;
    duration: number;
    quality: number;
    created_at: string;
}

export function SleepChart() {
    const { token } = useAuth();
    const { t, language } = useLanguage();
    const [data, setData] = useState<SleepData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            try {
                const res = await axios.get('/api/sleep/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data.data);
            } catch (error) {
                console.error('Failed to fetch sleep stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    const chartData = data.map(d => ({
        date: new Date(d.created_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' }),
        hours: d.duration,
        quality: d.quality,
    }));

    if (isLoading) {
        return <div className="h-48 flex items-center justify-center text-neutral-500 font-mono text-xs">{t('diary.sleep.loading')}</div>;
    }

    if (data.length === 0) {
        return (
            <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-6 mb-8 text-center">
                <p className="text-neutral-500 font-mono text-sm italic">
                    {t('diary.sleep.no_data')}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-neutral-900/30 border border-white/10 rounded-xl p-6 mb-8 relative overflow-hidden transition-all">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-heading font-bold flex items-center gap-2 text-white">
                    <Moon className="w-5 h-5 text-blue-400" />
                    {t('diary.sleep.title')}
                </h3>
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                    {t('diary.sleep.history_limit')}
                </div>
            </div>

            <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#666"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            unit="h"
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ color: '#60a5fa' }}
                        />
                        <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.quality >= 4 ? '#60a5fa' : entry.quality <= 2 ? '#f87171' : '#a78bfa'}
                                    fillOpacity={0.8}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="flex gap-4 mt-4 justify-center">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">{t('diary.sleep.quality_opt')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">{t('diary.sleep.quality_reg')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">{t('diary.sleep.quality_def')}</span>
                </div>
            </div>
        </div>
    );
}
