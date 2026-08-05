import React from 'react';
import { Calendar, Flame, Coffee, CheckCircle, Dumbbell, ChevronRight } from 'lucide-react';
import { WorkoutDay } from '../types';

interface WeeklyRoutineOverviewProps {
  workoutDays: WorkoutDay[];
  activeDayId: string;
  onSelectDay: (dayId: string) => void;
}

export const WeeklyRoutineOverview: React.FC<WeeklyRoutineOverviewProps> = ({
  workoutDays,
  activeDayId,
  onSelectDay,
}) => {
  return (
    <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5 mb-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-semibold text-white tracking-wide">Estructura Semanal Detectada</h2>
        </div>
        <span className="text-xs text-white/50 font-mono bg-[#0a0a0a] px-3 py-1 rounded-full border border-white/10">
          {workoutDays.filter(d => d.dayType === 'training').length} Entrenamientos · {workoutDays.filter(d => d.dayType === 'rest').length} Descansos
        </span>
      </div>

      {/* Grid of 7 Days */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {workoutDays.map((day) => {
          const isActive = day.id === activeDayId;
          const isRest = day.dayType === 'rest';

          // Calculate completed exercise count
          const totalEx = day.exercises.length;
          const completedEx = day.exercises.filter(ex => 
            ex.currentSets.length > 0 && ex.currentSets.every(s => s.completed)
          ).length;

          const isDayFullyDone = totalEx > 0 && completedEx === totalEx;

          return (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left relative overflow-hidden group ${
                isActive
                  ? 'bg-[#18181b] border-blue-500 shadow-lg shadow-blue-600/10 ring-1 ring-blue-500/40'
                  : 'bg-[#0a0a0a] border-white/10 hover:bg-white/5 hover:border-white/20'
              }`}
            >
              {/* Top Accent Line for Active */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-blue-400' : 'text-white/70'}`}>
                    {day.dayName}
                  </span>

                  {isRest ? (
                    <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Día de descanso">
                      <Coffee className="w-3.5 h-3.5" />
                    </span>
                  ) : isDayFullyDone ? (
                    <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Día completado">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20" title="Día de entrenamiento">
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
                    day.focusMuscles.slice(0, 2).map((muscle, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/60 border border-white/10">
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
                ) : (
                  <span>{totalEx} Ejercicios</span>
                )}
                
                <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isActive ? 'text-blue-400' : 'text-white/30'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
