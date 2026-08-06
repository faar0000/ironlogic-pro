import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, X, Plus, Minus, Bell, BellOff, Maximize2 } from 'lucide-react';

interface RestTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

const PRESETS = [
  { label: '1 min', sec: 60 },
  { label: '1.5 min', sec: 90 },
  { label: '2 min', sec: 120 },
  { label: '2.5 min', sec: 150 },
  { label: '3 min', sec: 180 },
  { label: '4 min', sec: 240 },
];

export const RestTimerModal: React.FC<RestTimerModalProps> = ({ isOpen, onClose, onOpen }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(120);
  const [initialDuration, setInitialDuration] = useState<number>(120);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [targetEndTime, setTargetEndTime] = useState<number | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const audioContextRef = useRef<AudioContext | null>(null);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      } catch (e) {
        console.error('Error requesting notification permission:', e);
      }
    }
  };

  // Helper to ensure AudioContext is unlocked by user gesture
  const initAudioContext = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    } catch (e) {
      console.log('AudioContext initialization error:', e);
    }
  };

  // Play triple-beep sound alert
  const playBeepAlarm = () => {
    try {
      initAudioContext();
      const ctx = audioContextRef.current;
      if (!ctx) return;

      const playFreq = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playFreq(880, now, 0.2);        // A5
      playFreq(1174.66, now + 0.25, 0.2); // D6
      playFreq(1760, now + 0.5, 0.4);   // A6
    } catch (e) {
      console.log('Audio beep prevented or not supported');
    }
  };

  const triggerCompletionAlert = () => {
    // 1. Play sound
    playBeepAlarm();

    // 2. Vibrate phone
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([300, 150, 300, 150, 500]);
      } catch (e) {}
    }

    // 3. Web Notification (crucial for locked screen / background)
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('⏱️ ¡Tiempo de Descanso Terminado!', {
          body: 'Es hora de comenzar tu siguiente serie. ¡A darle con todo!',
          icon: '/favicon.ico',
          tag: 'rest-timer-finish',
          requireInteraction: true,
        });
      } catch (e) {
        console.error('Notification dispatch error:', e);
      }
    }
  };

  // Main timer engine - Uses Date.now() wall-clock comparison
  useEffect(() => {
    if (!isRunning || !targetEndTime) {
      document.title = 'IronLogic Pro · Registro de Avance';
      return;
    }

    const checkTime = () => {
      const now = Date.now();
      const remainingMs = targetEndTime - now;
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      setSecondsLeft(remainingSec);

      // Update document title for background tab/browser lock screen previews
      const mins = Math.floor(remainingSec / 60);
      const secs = remainingSec % 60;
      const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      document.title = `⏱️ ${formatted} - Descanso | IronLogic Pro`;

      if (remainingSec <= 0) {
        setIsRunning(false);
        setTargetEndTime(null);
        document.title = 'IronLogic Pro · Registro de Avance';
        triggerCompletionAlert();
      }
    };

    // Immediate check
    checkTime();

    // Frequent tick (200ms) for high precision UI updates
    const interval = setInterval(checkTime, 200);

    // CRITICAL: Force immediate sync as soon as mobile phone unlocks or tab regains visibility
    const handleSync = () => {
      checkTime();
    };

    window.addEventListener('focus', handleSync);
    window.addEventListener('pageshow', handleSync);
    document.addEventListener('visibilitychange', handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('pageshow', handleSync);
      document.removeEventListener('visibilitychange', handleSync);
    };
  }, [isRunning, targetEndTime]);

  // Actions
  const startTimer = (durationSec: number) => {
    initAudioContext();
    const endTime = Date.now() + durationSec * 1000;
    setInitialDuration(durationSec);
    setSecondsLeft(durationSec);
    setTargetEndTime(endTime);
    setIsRunning(true);

    if ('Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission();
    }
  };

  const handleSelectPreset = (sec: number) => {
    startTimer(sec);
  };

  const addTime = (delta: number) => {
    initAudioContext();
    const newSeconds = Math.max(0, secondsLeft + delta);
    setSecondsLeft(newSeconds);
    if (newSeconds > initialDuration) {
      setInitialDuration(newSeconds);
    }
    if (isRunning) {
      setTargetEndTime(Date.now() + newSeconds * 1000);
    }
  };

  const toggleRun = () => {
    initAudioContext();
    if (isRunning) {
      // Pause
      setIsRunning(false);
      setTargetEndTime(null);
    } else {
      // Resume
      if (secondsLeft <= 0) {
        startTimer(initialDuration);
      } else {
        startTimer(secondsLeft);
      }
    }
  };

  const handleReset = () => {
    initAudioContext();
    setIsRunning(false);
    setTargetEndTime(null);
    setSecondsLeft(initialDuration);
    document.title = 'IronLogic Pro · Registro de Avance';
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = initialDuration > 0 ? ((initialDuration - secondsLeft) / initialDuration) * 100 : 0;

  // Render floating widget if closed but timer is running or active
  if (!isOpen) {
    if (!isRunning && secondsLeft === initialDuration) return null;

    return (
      <div className="fixed bottom-5 left-5 z-40 bg-[#0f0f0f]/95 border border-blue-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center space-x-3 text-white animate-fade-in">
        <button
          onClick={onOpen}
          className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity"
          title="Abrir cronómetro completo"
        >
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Timer className={`w-4 h-4 ${isRunning ? 'animate-pulse text-blue-400' : ''}`} />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-white/40 block font-medium uppercase tracking-wider">Descanso</span>
            <span className="font-mono text-base font-bold text-white tracking-tight">
              {formatTime(secondsLeft)}
            </span>
          </div>
        </button>

        <div className="h-6 w-px bg-white/10" />

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => addTime(15)}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-white/80"
            title="+15s"
          >
            +15s
          </button>

          <button
            onClick={toggleRun}
            className={`p-1.5 rounded-lg text-white font-bold transition-colors ${
              isRunning ? 'bg-amber-500 hover:bg-amber-400' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {onOpen && (
            <button
              onClick={onOpen}
              className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5"
              title="Expandir"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full Modal View
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          title="Minimizar cronómetro"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center space-x-2 text-blue-400 mb-2">
          <Timer className="w-5 h-5" />
          <h3 className="text-base font-semibold text-white uppercase tracking-wider">Cronómetro de Descanso</h3>
        </div>

        {/* Circular / Large timer display */}
        <div className="my-6">
          <div className="text-5xl font-bold text-white font-mono tracking-tight mb-2">
            {formatTime(secondsLeft)}
          </div>

          <div className="w-full bg-[#0a0a0a] rounded-full h-2.5 overflow-hidden border border-white/10 max-w-xs mx-auto">
            <div
              className="bg-blue-600 h-2.5 transition-all duration-300"
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
        <div className="border-t border-white/10 pt-4 mb-4">
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

        {/* Notification Permission banner */}
        <div className="border-t border-white/10 pt-3">
          {notificationPermission === 'granted' ? (
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 py-1.5 px-3 rounded-lg border border-emerald-500/20">
              <Bell className="w-3.5 h-3.5" />
              <span>Notificaciones activas al bloquear el móvil</span>
            </div>
          ) : (
            <button
              onClick={requestNotificationPermission}
              className="w-full flex items-center justify-center space-x-1.5 text-[11px] text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 py-2 px-3 rounded-lg border border-amber-500/20 transition-colors"
            >
              <BellOff className="w-3.5 h-3.5" />
              <span>Activar Notificaciones (al bloquear teléfono)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

