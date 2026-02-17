'use client';

import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Terminal, Activity, Moon, Send, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function Dashboard() {
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: latestMood, error } = useSWR('/api/mood', fetcher);

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (isOffline) {
        const pending = JSON.parse(localStorage.getItem('pending_logs') || '[]');
        pending.push({ score: mood, note, timestamp: Date.now() });
        localStorage.setItem('pending_logs', JSON.stringify(pending));
        alert('Saved offline. Will sync when online.');
        setNote('');
      } else {
        await axios.post('/api/mood', { score: mood, note });
        mutate('/api/mood');
        setNote('');
      }
    } catch (err) {
      console.error('Failed to submit mood', err);
      alert('Failed to log mood.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto p-6 space-y-8">

      {/* Header */}
      <header className="flex justify-between items-center border-b border-border pb-4">
        <div className="flex items-center space-x-2">
          <Terminal className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tighter">KERNEL_OF_SELF</h1>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          {isOffline ? (
            <span className="flex items-center text-destructive">
              <WifiOff className="w-4 h-4 mr-1" /> OFFLINE
            </span>
          ) : (
            <span className="flex items-center text-primary">
              <Wifi className="w-4 h-4 mr-1" /> CONNECTED
            </span>
          )}
        </div>
      </header>

      {/* Main Input Section */}
      <main className="flex-1 space-y-8">

        {/* Mood Dial */}
        <section className="space-y-4">
          <label className="block text-sm font-medium text-muted-foreground uppercase tracking-widest">
            Current State (1-10)
          </label>
          <div className="relative flex items-center justify-center p-8 bg-card rounded-xl border border-border shadow-[0_0_20px_rgba(0,255,0,0.1)]">
            <motion.div
              key={mood}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-black text-primary"
            >
              {mood}
            </motion.div>
            <input
              type="range"
              min="1"
              max="10"
              value={mood}
              onChange={(e) => setMood(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground px-2">
            <span>DYSTOPIAN</span>
            <span>NEUTRAL</span>
            <span>UTOPIAN</span>
          </div>
        </section>

        {/* Note Input */}
        <section className="space-y-4">
          <label className="block text-sm font-medium text-muted-foreground uppercase tracking-widest">
            Log Entry (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Analizar estado del sistema..."
            className="w-full h-32 bg-card border border-border rounded-lg p-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none placeholder:text-muted"
          />
        </section>

        {/* Submit Action */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-2 bg-primary text-black font-bold py-4 rounded-lg hover:bg-opacity-90 active:scale-95 transition-all text-lg uppercase tracking-wider"
        >
          {isSubmitting ? <Activity className="animate-spin" /> : <Send />}
          <span>{isOffline ? 'Log Offline' : 'Commit to Core'}</span>
        </button>

      </main>

      {/* Footer / Status */}
      <footer className="text-center text-xs text-muted-foreground pt-8">
        <p>SYSTEM STATUS: {latestMood?.current_mood ? `LAST RECORDED: ${latestMood.current_mood}/10` : 'WAITING FOR DATA...'}</p>
      </footer>
    </div>
  );
}
