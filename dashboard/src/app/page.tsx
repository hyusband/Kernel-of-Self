'use client';

import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import { Hero } from '@/components/landing/hero';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { MoodSlider } from '@/components/ui/mood-slider';
import { BlurFade } from '@/components/ui/blur-fade';
import { Activity, ArrowRight, Brain, Terminal, Languages, Lock, Unlock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n-context';
import { useVault } from '@/hooks/use-vault';
import { VaultModal } from '@/components/vault/vault-modal';
import { cn } from '@/lib/utils';
import { OracleWidget } from '@/components/oracle/oracle-widget';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function Dashboard() {
  const { t, language, setLanguage } = useLanguage();
  const { isUnlocked, unlock, lock, encrypt } = useVault();

  const [mood, setMood] = useState(5);
  const [note, setNote] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

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
        await axios.post('/api/mood', payload);
        mutate('/api/mood');
        setNote('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to commit log.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen text-white selection:bg-white selection:text-black overflow-x-hidden transition-colors duration-700",
      isUnlocked ? "bg-neutral-950 selection:bg-red-500 selection:text-white" : "bg-black"
    )}>

      <VaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        onUnlock={handleVaultUnlock}
        isUnlocked={isUnlocked}
      />

      <OracleWidget />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-6 lg:px-12 transition-all duration-300">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300",
            isUnlocked
              ? "bg-red-900/20 border-red-500/50 group-hover:bg-red-500 group-hover:text-black shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              : "bg-gradient-to-tr from-neutral-800 to-neutral-600 border-white/10 group-hover:bg-white group-hover:text-black"
          )}>
            {isUnlocked ? <ShieldCheck className="w-4 h-4 text-red-500 group-hover:text-black" /> : <Brain className="w-4 h-4 text-white group-hover:text-black" />}
          </div>
          <span className={cn(
            "font-heading font-bold text-lg tracking-tight transition-colors",
            isUnlocked ? "text-red-500 group-hover:text-red-400" : "group-hover:text-neutral-300"
          )}>
            {isUnlocked ? "VAULT // REPO" : t('app.title')}
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={handleVaultToggle}
            className={cn(
              "p-2 rounded-full transition-all duration-300",
              isUnlocked ? "text-red-500 hover:bg-red-900/20 hover:scale-110" : "text-neutral-400 hover:text-white hover:bg-white/10"
            )}
            aria-label="Toggle Vault"
          >
            {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>

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
          <div className={cn(
            "w-2 h-2 rounded-full shadow-[0_0_10px]",
            isUnlocked ? "bg-red-500 shadow-red-500" : "bg-green-500 shadow-green-500"
          )} />
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
              <SpotlightCard className={cn(
                "p-8 h-full min-h-[300px] flex flex-col justify-between group transition-colors duration-500",
                isUnlocked ? "border-red-900/30 bg-red-950/10" : ""
              )}>
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
                      className={cn("h-full transition-all duration-1000 ease-out", isUnlocked ? "bg-red-600 shadow-[0_0_10px_red]" : "bg-white")}
                      style={{ width: `${(latestMood?.current_mood || 0) * 10}%` }}
                    />
                  </div>
                  <p className="text-xs text-right text-neutral-600 font-mono group-hover:text-neutral-400 transition-colors">SYNC_ID: 0x{Date.now().toString(16).slice(-4)}</p>
                </div>
              </SpotlightCard>
            </BlurFade>

            {/* Input Column */}
            <BlurFade delay={0.3} className="h-full space-y-6">
              <SpotlightCard className={cn(
                "p-8 space-y-8 transition-colors duration-500",
                isUnlocked ? "border-red-900/50 bg-black shadow-[0_0_30px_rgba(220,38,38,0.1)]" : ""
              )}>
                <div>
                  <h2 className="text-sm font-mono text-neutral-400 uppercase tracking-widest mb-6 flex justify-between items-center">
                    {t('input.title')}
                    {isUnlocked && <span className="text-xs text-red-500 animate-pulse font-bold tracking-widest">ENCRYPTED</span>}
                  </h2>
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
                      "w-full bg-neutral-950/50 border rounded-lg p-4 text-sm text-white focus:outline-none transition-all resize-none h-32 leading-relaxed",
                      isUnlocked
                        ? "border-red-900/50 placeholder:text-red-900/50 focus:border-red-500 focus:ring-1 focus:ring-red-900 font-mono text-red-200"
                        : "border-neutral-800 placeholder:text-neutral-700 focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600"
                    )}
                  />
                  {isUnlocked && (
                    <div className="absolute top-2 right-2">
                      <Lock className="w-3 h-3 text-red-500/50" />
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
            </BlurFade>

          </div>
        </section>

      </main>

    </div>
  );
}
