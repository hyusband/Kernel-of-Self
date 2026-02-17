'use client';

import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import { Hero } from '@/components/landing/hero';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { MoodSlider } from '@/components/ui/mood-slider';
import { BlurFade } from '@/components/ui/blur-fade';
import { Activity, Wifi, WifiOff, ArrowRight, Brain, Terminal, Languages } from 'lucide-react';
import { useLanguage } from '@/lib/i18n-context';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function Dashboard() {
  const { t, language, setLanguage } = useLanguage();
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: latestMood } = useSWR('/api/mood', fetcher);

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

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (isOffline) {
        const pending = JSON.parse(localStorage.getItem('pending_logs') || '[]');
        pending.push({ score: mood, note, timestamp: Date.now() });
        localStorage.setItem('pending_logs', JSON.stringify(pending));
        alert(t('input.syncq'));
        setNote('');
      } else {
        await axios.post('/api/mood', { score: mood, note });
        mutate('/api/mood');
        setNote('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-6 lg:px-12 transition-all duration-300">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neutral-800 to-neutral-600 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-colors duration-300">
            <Brain className="w-4 h-4 text-white group-hover:text-black transition-colors duration-300" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight group-hover:text-neutral-300 transition-colors">{t('app.title')}</span>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-neutral-400 hover:text-white"
            aria-label="Toggle Language"
          >
            <Languages className="w-4 h-4" />
          </button>
          {isOffline && (
            <span className="text-xs font-mono text-red-500 border border-red-900/50 bg-red-950/20 px-2 py-1 rounded animate-pulse">{t('app.offline')}</span>
          )}
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
        </div>
      </nav>

      {/* Hybrid Layout */}
      <main className="pt-16">

        {/* Landing Hero */}
        <section className="relative">
          <BlurFade delay={0.1}>
            <Hero />
          </BlurFade>
        </section>

        {/* Dashboard Interface */}
        <section className="relative z-20 -mt-20 pb-20 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Status Column */}
            <BlurFade delay={0.2} className="h-full space-y-6">
              <SpotlightCard className="p-8 h-full min-h-[300px] flex flex-col justify-between group">
                <div>
                  <h2 className="text-sm font-mono text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> {t('status.title')}
                  </h2>
                  <div className="flex items-baseline gap-1 text-6xl font-heading font-bold text-white tracking-tighter leading-none my-4">
                    <span>{latestMood?.current_mood ? latestMood.current_mood : '--'}</span>
                    <span className="text-2xl text-neutral-600 font-normal tracking-normal">/10</span>
                  </div>
                  <p className="text-sm text-neutral-500 font-mono">{t('status.label')}</p>
                </div>

                <div className="space-y-2">
                  <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-1000 ease-out"
                      style={{ width: `${(latestMood?.current_mood || 0) * 10}%` }}
                    />
                  </div>
                  <p className="text-xs text-right text-neutral-600 font-mono group-hover:text-neutral-400 transition-colors">SYNC_ID: 0x{Date.now().toString(16).slice(-4)}</p>
                </div>
              </SpotlightCard>
            </BlurFade>

            {/* Input Column */}
            <BlurFade delay={0.3} className="h-full space-y-6">
              <SpotlightCard className="p-8 space-y-8">
                <div>
                  <h2 className="text-sm font-mono text-neutral-400 uppercase tracking-widest mb-6">{t('input.title')}</h2>
                  <MoodSlider value={mood} onChange={setMood} />
                  <div className="flex justify-between text-xs text-neutral-600 mt-2 font-mono px-2">
                    <span>{t('input.labels.crit')}</span>
                    <span>{t('input.labels.stable')}</span>
                    <span>{t('input.labels.peak')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t('input.placeholder')}
                    className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg p-4 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all resize-none h-32 leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="group w-full h-12 bg-white text-black font-medium rounded-lg hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {isSubmitting ? <Activity className="w-4 h-4 animate-spin" /> : <span>{t('input.submit')}</span>}
                  {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </SpotlightCard>
            </BlurFade>

          </div>
        </section>

      </main>

    </div>
  );
}
