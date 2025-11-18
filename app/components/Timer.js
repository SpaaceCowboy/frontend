'use client';

import { useState, useEffect } from 'react';
import useSound from 'use-sound';
import { Sun, Moon, Volume2, VolumeX, History } from 'lucide-react';

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Load sessions from localStorage
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('focusSessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [play] = useSound('/sounds/bell.mp3', { volume: isMuted ? 0 : 0.55 });

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Timer
  useEffect(() => {
    if (!isRunning || timeLeft === 0) return;
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [isRunning, timeLeft]);

  // Session end → save it
  useEffect(() => {
    if (timeLeft !== 0) return;


    const now = new Date();
    const session = {
      date: now.toISOString(),
      type: isFocus ? 'focus' : 'break',
      minutes: isFocus ? 30 : 15,
      start: new Date(now.getTime() - (isFocus ? 30 * 60 * 1000 : 15 * 60 * 1000)).toISOString(),
      end: now.toISOString(),
    };;

    const newSessions = [...sessions, session];
    setSessions(newSessions);
    localStorage.setItem('focusSessions', JSON.stringify(newSessions));

    if (!isMuted) play();
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
    setIsFocus(f => !f);
    setTimeLeft(isFocus ? 15 * 60 : 30 * 60);
    setIsRunning(false);
  }, [timeLeft, isFocus, isMuted, play, sessions]);

  // Today’s stats
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === today && s.type === 'focus');
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.minutes, 0);
  const hours = Math.floor(todayMinutes / 60);
  const mins = todayMinutes % 60;

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  return (
    <>
      <div className="fixed inset-0 bg-white dark:bg-black text-black dark:text-white flex">
        {/* Main Timer – takes most space */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="text-center">
            <div className="text-sm tracking-widest opacity-60 mb-12 font-light">
              {isFocus ? 'FOCUS' : 'BREAK'}
            </div>
            <div className="text-9xl font-thin tracking-tight select-none">
              {minutes}
              <span className="inline-block animate-pulse opacity-30">:</span>
              {seconds}
            </div>

            <div className="mt-20 flex justify-center gap-16">
              <button
                onClick={() => setIsRunning(r => !r)}
                className="text-2xl tracking-widest border-b-4 border-current pb-2 transition-all hover:border-opacity-60 active:scale-95"
              >
                {isRunning ? 'PAUSE' : 'START'}
              </button>
              <button
                onClick={() => {
                  setIsRunning(false);
                  setTimeLeft(isFocus ? 30 * 60 : 15 * 60);
                }}
                className="text-2xl tracking-widest opacity-40 hover:opacity-70 transition"
              >
                RESET
              </button>
            </div>
          </div>
        </div>

        {/* History Sidebar – desktop */}
        <div className="hidden md:block w-96 border-l border-white/10 dark:border-white/10 p-8 overflow-y-auto">
          <h2 className="text-lg tracking-widest opacity-60 mb-6">Today</h2>
          <div className="text-4xl font-thin mb-8">
            {hours > 0 && `${hours}h `}{mins}m focused
          </div>
          <div className="text-sm opacity-60 mb-4">{todaySessions.length} sessions</div>

          <div className="space-y-3">
            {todaySessions.map((s, i) => (
              <div key={i} className="flex justify-between text-sm opacity-80">
                <span>{new Date(s.start).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                <span>→</span>
                <span>{new Date(s.end).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
              </div>
            ))}
            {todaySessions.length === 0 && (
              <div className="text-center opacity-40 mt-10">No sessions yet</div>
            )}
          </div>
        </div>

        {/* Mobile history toggle button */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="md:hidden fixed bottom-8 left-8 opacity-50 hover:opacity-90"
        >
          <History size={32} />
        </button>

        {/* Mobile history drawer */}
        {showHistory && (
          <div className="md:hidden fixed inset-0 bg-black/90 backdrop-blur z-50 p-8 flex flex-col">
            <button onClick={() => setShowHistory(false)} className="self-end mb-8">
              × close
            </button>
            <h2 className="text-2xl mb-4">Today</h2>
            <div className="text-5xl font-thin mb-6">
              {hours > 0 && `${hours}h `}{mins}m
            </div>
            {todaySessions.map((s, i) => (
              <div key={i} className="py-3 border-b border-white/10 text-sm">
                {s.start.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} → {s.end.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top-right icons */}
      <button
        onClick={() => setIsDark(d => !d)}
        className="fixed top-8 right-8 opacity-50 hover:opacity-90 transition-all active:scale-90 z-10"
      >
        {isDark ? <Sun size={32} /> : <Moon size={32} />}
      </button>

      <button
        onClick={() => setIsMuted(m => !m)}
        className="fixed bottom-8 right-8 opacity-50 hover:opacity-90 transition-all active:scale-90 z-10"
      >
        {isMuted ? <VolumeX size={32} /> : <Volume2 size={32} />}
      </button>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        body { animation: fadeIn 1s ease-out; }
      `}</style>
    </>
  );
}