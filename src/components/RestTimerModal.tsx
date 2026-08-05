import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, X, Plus, Minus } from 'lucide-react';

interface RestTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS = [
  { label: '1 min', sec: 60 },
  { label: '1.5 min', sec: 90 },
  { label: '2 min', sec: 120 },
  { label: '2.5 min', sec: 150 },
  { label: '3 min', sec: 180 },
  { label: '4 min', sec: 240 },
];

export const RestTimerModal: React.FC<RestTimerModalProps> = ({ isOpen, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(120);
  const [initialDuration, setInitialDuration] = useState<number>(120);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      playBeep();
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.log('Audio beep prevented or not supported');
    }
  };

  if (!isOpen) return null;

  const handleSelectPreset = (sec: number) => {
    setInitialDuration(sec);
    setSecondsLeft(sec);
    setIsRunning(true);
  };

  const addTime = (delta: number) => {
    setSecondsLeft((prev) => {
      const next = Math.max(0, prev + delta);
      if (next > initialDuration) {
        setInitialDuration(next);
      }
      return next;
    });
  };

  const toggleRun = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(initialDuration);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = initialDuration > 0 ? ((initialDuration - secondsLeft) / initialDuration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center space-x-2 text-blue-400 mb-4">
          <Timer className="w-5 h-5" />
          <h3 className="text-base font-semibold text-white uppercase tracking-wider">Cronómetro de Descanso</h3>
        </div>

        {/* Circular / Large timer display */}
        <div className="my-6">
          <div className="text-5xl font-bold text-white font-mono tracking-tight mb-2">
            {formatTime(secondsLeft)}
          </div>

          <div className="w-full bg-[#0a0a0a] rounded-full h-2 overflow-hidden border border-white/10 max-w-xs mx-auto">
            <div
              className="bg-blue-600 h-2 transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Adjustments & Controls */}
        <div className="flex items-center justify-center space-x-3 mb-6">
          <button
            onClick={() => addTime(-15)}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-full transition-colors flex items-center justify-center"
            title="-15 segundos"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={toggleRun}
            className={`p-4 rounded-full font-bold text-white transition-transform active:scale-95 shadow-lg ${
              isRunning ? 'bg-amber-500 hover:bg-amber-400' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleReset}
            className="p-3.5 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-full transition-colors"
            title="Reiniciar"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => addTime(15)}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-full transition-colors flex items-center justify-center"
            title="+15 segundos"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">Tiempos de Descanso</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.sec}
                onClick={() => handleSelectPreset(p.sec)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  initialDuration === p.sec
                    ? 'bg-blue-600/30 text-blue-400 border-blue-500/60 shadow-lg shadow-blue-500/10'
                    : 'bg-[#0a0a0a] text-white/70 border-white/10 hover:text-white hover:bg-white/5'
                }`}
              >
                {p.label} <span className="text-[10px] text-white/40 font-normal">({p.sec}s)</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
