import React, { useState } from 'react';
import { 
  Calendar, Flame, Coffee, CheckCircle, Dumbbell, ChevronRight, 
  RotateCcw, LayoutGrid, CalendarDays, ChevronDown, ChevronUp, Sparkles 
} from 'lucide-react';
import { WorkoutDay } from '../types';

interface WeeklyRoutineOverviewProps {
  workoutDays: WorkoutDay[];
  activeDayId: string;
  activeWeekMonday?: string;
  onSelectDay: (dayId: string) => void;
  onStartNewWeek?: () => void;
}

export const WeeklyRoutineOverview: React.FC<WeeklyRoutineOverviewProps> = ({
  workoutDays,
  activeDayId,
  activeWeekMonday,
  onSelectDay,
  onStartNewWeek,
}) => {
  // Default to compact horizontal strip mode for optimal mobile ergonomics
  const [viewMode, setViewMode] = useState<'strip' | 'grid'>('strip');

  const getWeekRangeLabel = () => {
    if (!activeWeekMonday) {
      const now = new Date();
      const day = now.getDay();
      const diff = (day === 0 ? -6 : 1 - day);
      const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
      const sun = new Date(mon);
      sun.setDate(sun.getDate() + 6);
      return `${mon.getDate()}/${mon.getMonth() + 1} - ${sun.getDate()}/${sun.getMonth() + 1}/${sun.getFullYear()}`;
    }
    const parts = activeWeekMonday.split('-').map(Number);
    const mon = new Date(parts[0], parts[1] - 1, parts[2]);
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    return `${mon.getDate()}/${mon.getMonth() + 1} - ${sun.getDate()}/${sun.getMonth() + 1}/${sun.getFullYear()}`;
  };

  // Helper to get day date number (e.g. 17, 18, 19) for each day index (0..6)
  const getDayDateInfo = (dayIndex: number) => {
    let baseMonday: Date;
    if (activeWeekMonday) {
      const parts = activeWeekMonday.split('-').map(Number);
      baseMonday = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      const now = new Date();
      const day = now.getDay();
      const diff = (day === 0 ? -6 : 1 - day);
      baseMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
    }
    const targetDate = new Date(baseMonday);
    targetDate.setDate(baseMonday.getDate() + dayIndex);
    return {
      dayNum: targetDate.getDate(),
      monthNum: targetDate.getMonth() + 1,
    };
  };

  const activeDay = workoutDays.find(d => d.id === activeDayId) || workoutDays[0];
  const trainingCount = workoutDays.filter(d => d.dayType === 'training').length;
  const restCount = workoutDays.filter(d => d.dayType === 'rest').length;

  // Active day stats
  const activeTotalEx = activeDay ? activeDay.exercises.length : 0;
  const activeTotalSets = activeDay ? activeDay.exercises.reduce((acc, ex) => acc + ex.currentSets.length, 0) : 0;
  const activeCompletedSets = activeDay ? activeDay.exercises.reduce((acc, ex) => acc + ex.currentSets.filter(s => s.completed).length, 0) : 0;
  const activeCompletedEx = activeDay ? activeDay.exercises.filter(ex => ex.currentSets.length > 0 && ex.currentSets.every(s => s.completed)).length : 0;
  const activePercent = activeTotalSets > 0 ? Math.round((activeCompletedSets / activeTotalSets) * 100) : 0;

  return (
    <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-3.5 sm:p-5 mb-5 shadow-xl transition-all">
      
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-wide truncate">
                Estructura Semanal
              </h2>
              <span className="hidden xs:inline-block text-[10px] text-blue-400 bg-blue-600/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono">
                {getWeekRangeLabel()}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-white/50 font-mono truncate">
              {trainingCount} Entrenamientos · {restCount} Descansos
            </p>
          </div>
        </div>

        {/* View Toggle & New Week Button */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => setViewMode(prev => prev === 'strip' ? 'grid' : 'strip')}
            className="inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-1 text-[11px] font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
            title={viewMode === 'strip' ? 'Ver cuadrícula completa' : 'Ver modo compacto'}
          >
            {viewMode === 'strip' ? (
              <>
                <LayoutGrid className="w-3.5 h-3.5 sm:mr-1 text-blue-400" />
                <span className="hidden sm:inline">Ver Cuadrícula</span>
              </>
            ) : (
              <>
                <CalendarDays className="w-3.5 h-3.5 sm:mr-1 text-blue-400" />
                <span className="hidden sm:inline">Modo Compacto</span>
              </>
            )}
          </button>

          {onStartNewWeek && (
            <button
              onClick={onStartNewWeek}
              className="inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-1 text-[11px] font-semibold text-blue-300 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors cursor-pointer"
              title="Iniciar un nuevo ciclo semanal archivando el actual en el historial"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:mr-1 text-blue-400" />
              <span className="hidden sm:inline">Nueva Semana</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. COMPACT HORIZONTAL DAY STRIP (Default) */}
      {viewMode === 'strip' ? (
        <div className="space-y-2.5">
          {/* Day Pills Bar: 7 columns on all screens with touch-friendly targets */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {workoutDays.map((day, idx) => {
              const isActive = day.id === activeDayId;
              const isRest = day.dayType === 'rest';
              const dateInfo = getDayDateInfo(idx);

              const totalEx = day.exercises.length;
              const totalSets = day.exercises.reduce((acc, ex) => acc + ex.currentSets.length, 0);
              const completedSets = day.exercises.reduce((acc, ex) => acc + ex.currentSets.filter(s => s.completed).length, 0);
              const isFullyDone = !isRest && totalEx > 0 && totalSets > 0 && completedSets === totalSets;
              const isInProgress = !isRest && completedSets > 0 && completedSets < totalSets;

              // Short 3-letter day name e.g. LUN, MAR, MIÉ
              const shortName = day.dayName.slice(0, 3).toUpperCase();

              return (
                <button
                  key={day.id}
                  onClick={() => onSelectDay(day.id)}
                  className={`flex flex-col items-center justify-between py-2 px-0.5 sm:py-2.5 sm:px-2 rounded-xl border transition-all cursor-pointer relative text-center select-none ${
                    isActive
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/25 ring-2 ring-blue-400/40 transform scale-[1.02]'
                      : isFullyDone
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-white hover:border-emerald-500/60'
                      : isRest
                      ? 'bg-[#0a0a0a] border-white/5 text-white/50 hover:border-white/20'
                      : 'bg-[#0a0a0a] border-white/10 text-white/80 hover:bg-white/5 hover:border-white/20'
                  }`}
                  title={`${day.dayName}: ${day.title}`}
                >
                  {/* Active dot indicator on top */}
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white mb-0.5 animate-pulse" />
                  )}

                  {/* Short Day Name */}
                  <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                    isActive ? 'text-white' : isRest ? 'text-white/40' : 'text-white/80'
                  }`}>
                    {shortName}
                  </span>

                  {/* Day Date Number */}
                  <span className={`text-xs sm:text-sm font-mono font-bold my-0.5 ${
                    isActive ? 'text-white' : 'text-white/60'
                  }`}>
                    {dateInfo.dayNum}
                  </span>

                  {/* Status Indicator Icon / Badge */}
                  <div className="mt-0.5 flex items-center justify-center">
                    {isRest ? (
                      <Coffee className={`w-3 h-3 ${isActive ? 'text-white' : 'text-amber-400/80'}`} />
                    ) : isFullyDone ? (
                      <CheckCircle className={`w-3 h-3 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                    ) : isInProgress ? (
                      <span className={`text-[9px] font-bold font-mono px-1 rounded ${
                        isActive ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {completedSets}/{totalSets}
                      </span>
                    ) : (
                      <Dumbbell className={`w-2.5 h-2.5 ${isActive ? 'text-white/90' : 'text-white/30'}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Day Quick Focus Strip */}
          {activeDay && (
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center space-x-2.5">
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-blue-600/20 border border-blue-500/30 text-blue-400 shrink-0 font-mono">
                  {activeDay.dayName}
                </span>

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-white truncate">
                    {activeDay.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-[10px] text-white/50 truncate">
                    {activeDay.dayType === 'rest' ? (
                      <span className="text-amber-400 font-medium">Día de Recuperación y Descanso</span>
                    ) : (
                      <>
                        <span className="truncate">{activeDay.focusMuscles.join(' / ') || 'Entrenamiento'}</span>
                        <span>·</span>
                        <span className={activePercent === 100 ? 'text-emerald-400 font-semibold' : 'text-blue-400 font-semibold'}>
                          {activeCompletedEx}/{activeTotalEx} ejercicios ({activePercent}%)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress mini bar */}
              {activeDay.dayType !== 'rest' && activeTotalSets > 0 && (
                <div className="w-20 sm:w-28 shrink-0 flex flex-col items-end space-y-1">
                  <span className="text-[10px] font-mono text-white/60">
                    {activeCompletedSets}/{activeTotalSets} series
                  </span>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        activePercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${activePercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* 2. EXPANDED GRID VIEW (Detailed cards) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {workoutDays.map((day, idx) => {
            const isActive = day.id === activeDayId;
            const isRest = day.dayType === 'rest';
            const dateInfo = getDayDateInfo(idx);

            const totalEx = day.exercises.length;
            const totalSets = day.exercises.reduce((acc, ex) => acc + ex.currentSets.length, 0);
            const completedSets = day.exercises.reduce((acc, ex) => acc + ex.currentSets.filter(s => s.completed).length, 0);
            const completedEx = day.exercises.filter(ex => ex.currentSets.length > 0 && ex.currentSets.every(s => s.completed)).length;

            const isDayFullyDone = !isRest && totalEx > 0 && totalSets > 0 && completedSets === totalSets;
            const isDayInProgress = !isRest && completedSets > 0 && completedSets < totalSets;

            return (
              <button
                key={day.id}
                onClick={() => onSelectDay(day.id)}
                className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left relative overflow-hidden group cursor-pointer ${
                  isActive
                    ? 'bg-[#18181b] border-blue-500 shadow-lg shadow-blue-600/10 ring-1 ring-blue-500/40'
                    : 'bg-[#0a0a0a] border-white/10 hover:bg-white/5 hover:border-white/20'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-blue-400' : 'text-white/70'}`}>
                        {day.dayName}
                      </span>
                      <span className="text-[10px] font-mono text-white/40">
                        {dateInfo.dayNum}/{dateInfo.monthNum}
                      </span>
                    </div>

                    {isRest ? (
                      <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Día de descanso">
                        <Coffee className="w-3.5 h-3.5" />
                      </span>
                    ) : isDayFullyDone ? (
                      <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Día completado (100% de series)">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </span>
                    ) : isDayInProgress ? (
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-bold" title="En progreso">
                        {completedSets}/{totalSets}
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20" title="Por iniciar">
                        <Flame className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-medium text-white line-clamp-1 mb-2">
                    {day.title}
                  </h3>

                  {/* Focus muscles tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {isRest ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/30 text-amber-300 border border-amber-800/30">
                        Recuperación
                      </span>
                    ) : (
                      day.focusMuscles.slice(0, 2).map((muscle, mIdx) => (
                        <span key={mIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/60 border border-white/10">
                          {muscle}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Footer info */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
                  {isRest ? (
                    <span className="text-amber-400/80 font-medium">Descanso</span>
                  ) : isDayFullyDone ? (
                    <span className="text-emerald-400 font-medium">{completedEx}/{totalEx} listos (100%)</span>
                  ) : isDayInProgress ? (
                    <span className="text-blue-400 font-medium">{completedSets}/{totalSets} series</span>
                  ) : (
                    <span>{totalEx} Ejercicios</span>
                  )}
                  
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isActive ? 'text-blue-400' : 'text-white/30'}`} />
                </div>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
};

