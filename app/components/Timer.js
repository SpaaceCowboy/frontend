'use client';

import { useState, useEffect } from 'react';
import useSound from 'use-sound';
import { Sun, Moon, Volume2, VolumeX } from 'lucide-react';

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const [play] = useSound('/sounds/bell.mp3', { volume: isMuted ? 0 : 0.6 });

  // THIS SINGLE LINE IS THE ONLY ONE THAT MATTERS
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Timer
  useEffect(() => {
    if (!isRunning || timeLeft === 0) return;
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      if (!isMuted) play();
      setIsFocus(f => !f);
      setTimeLeft(isFocus ? 15 * 60 : 30 * 60);
      setIsRunning(false);
    }
  }, [timeLeft]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className={`fixed inset-0 flex items-center justify-center text-black transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      
      <div className="text-center">
        <div className="text-sm tracking-widest opacity-60 mb-12">
          {isFocus ? 'FOCUS' : 'BREAK'}
        </div>
        <div className="text-9xl font-thin tracking-tight">
          {minutes}<span className="opacity-30">:</span>{seconds}
        </div>

        <div className="mt-20 flex justify-center gap-16">
          <button onClick={() => setIsRunning(r => !r)} className="text-2xl tracking-wider border-b-4 pb-2">
            {isRunning ? 'PAUSE' : 'START'}
          </button>
          <button onClick={() => { setIsRunning(false); setTimeLeft(isFocus ? 30*60 : 15*60); }} className="text-2xl tracking-wider opacity-40">
            RESET
          </button>
        </div>
      </div>

      {/* Toggle buttons */}
      <button onClick={() => setIsDark(d => !d)} className="fixed top-8 right-8">
        {isDark ? <Sun size={32} /> : <Moon size={32} />}
      </button>
      <button onClick={() => setIsMuted(m => !m)} className="fixed bottom-8 right-8 opacity-50">
        {isMuted ? <VolumeX size={32} /> : <Volume2 size={32} />}
      </button>
    </div>
  );
}