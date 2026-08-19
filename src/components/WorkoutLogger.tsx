import React, { useState } from 'react';
import { 
  Dumbbell, CheckCircle2, Circle, Plus, Trash2, ArrowRight, History, 
  Sparkles, Timer, Coffee, Award, AlertCircle, Copy, Check, ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkoutDay, Exercise, SetLog, GymProgram } from '../types';
import { OverloadAdvisorBadge, OverloadAdvisorDrawer } from './OverloadAdvisorCard';
import { getMostRecentLogForExercise, ExerciseLogRef } from '../utils/progressiveOverload';

interface WorkoutLoggerProps {
  day: WorkoutDay;
  program?: GymProgram;
  onUpdateDay: (updatedDay: WorkoutDay) => void;
  onOpenRestTimer: () => void;
  onAddExerciseClick: () => void;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  day,
  program,
  onUpdateDay,
  onOpenRestTimer,
  onAddExerciseClick,
}) => {
  const [copiedExerciseId, setCopiedExerciseId] = useState<string | null>(null);
  const [expandedAdvisorIds, setExpandedAdvisorIds] = useState<Record<string, boolean>>({});

  const toggleAdvisorExpand = (exerciseId: string) => {
    setExpandedAdvisorIds(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  const handleToggleJointDiscomfort = (exerciseId: string) => {
    const updatedExercises = day.exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          hasJointDiscomfort: !ex.hasJointDiscomfort,
        };
      }
      return ex;
    });
    onUpdateDay({ ...day, exercises: updatedExercises });
  };

  if (day.dayType === 'rest') {
    return (
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-8 text-center max-w-2xl mx-auto my-8 shadow-2xl">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
          <Coffee className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-medium tracking-tight text-white mb-2">{day.dayName}: {day.title}</h2>
        <p className="text-sm text-white/50 max-w-md mx-auto mb-6">
          El crecimiento muscular y la adaptación ocurren durante el descanso. Aprovecha hoy para recuperarte, hidratarte bien y estirar suavemente.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Hidratación</h4>
            <p className="text-xs text-white/60">Toma entre 2.5L y 3.5L de agua para reponer glucógeno.</p>
          </div>
          <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl">
            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Sueño Reparador</h4>
            <p className="text-xs text-white/60">Intenta dormir entre 7 y 9 horas para liberar hormona de crecimiento.</p>
          </div>
          <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl">
            <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">Movilidad Activa</h4>
            <p className="text-xs text-white/60">Estiramientos dinámicos o caminata ligera de 20 min.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate progress stats
  const totalExercises = day.exercises.length;
  const completedExercises = day.exercises.filter(ex => 
    ex.currentSets.length > 0 && ex.currentSets.every(s => s.completed)
  ).length;

  const totalSetsCount = day.exercises.reduce((acc, ex) => acc + ex.currentSets.length, 0);
  const completedSetsCount = day.exercises.reduce((acc, ex) => 
    acc + ex.currentSets.filter(s => s.completed).length, 0
  );

  const progressPercent = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  // Handlers for modifying sets
  const handleSetChange = (exerciseId: string, setId: string, field: keyof SetLog, value: any) => {
    const updatedExercises = day.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;

      const updatedSets = ex.currentSets.map(s => {
        if (s.id !== setId) return s;
        return { ...s, [field]: value };
      });

      return { ...ex, currentSets: updatedSets };
    });

    onUpdateDay({ ...day, exercises: updatedExercises });
  };

  const handleToggleSetComplete = (exerciseId: string, setId: string) => {
    const updatedExercises = day.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;

      const updatedSets = ex.currentSets.map(s => {
        if (s.id !== setId) return s;
        return { ...s, completed: !s.completed };
      });

      return { ...ex, currentSets: updatedSets };
    });

    // Check if entire workout just completed
    const newCompletedSets = updatedExercises.reduce((acc, ex) => 
      acc + ex.currentSets.filter(s => s.completed).length, 0
    );

    if (newCompletedSets === totalSetsCount && totalSetsCount > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    onUpdateDay({ ...day, exercises: updatedExercises });
  };

  const handleAddSet = (exerciseId: string) => {
    const updatedExercises = day.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;

      const lastSet = ex.currentSets[ex.currentSets.length - 1];
      const newSetNumber = ex.currentSets.length + 1;

      const newSet: SetLog = {
        id: `c-new-${Date.now()}-${newSetNumber}`,
        setNumber: newSetNumber,
        weight: lastSet ? lastSet.weight : (ex.previousLogs?.weight || 20),
        reps: lastSet ? lastSet.reps : (ex.previousLogs?.reps || 10),
        completed: false
      };

      return { ...ex, currentSets: [...ex.currentSets, newSet] };
    });

    onUpdateDay({ ...day, exercises: updatedExercises });
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    const updatedExercises = day.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      if (ex.currentSets.length <= 1) return ex; // keep at least 1 set

      const filteredSets = ex.currentSets
        .filter(s => s.id !== setId)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));

      return { ...ex, currentSets: filteredSets };
    });

    onUpdateDay({ ...day, exercises: updatedExercises });
  };

  const handleCopyPrevData = (exercise: Exercise, effectivePrevLog?: ExerciseLogRef) => {
    const logToUse = effectivePrevLog || exercise.previousLogs;
    if (!logToUse) return;

    const prevWeight = logToUse.weight;
    const prevReps = logToUse.reps;

    const updatedExercises = day.exercises.map(ex => {
      if (ex.id !== exercise.id) return ex;

      const updatedSets = ex.currentSets.map(s => ({
        ...s,
        weight: prevWeight,
        reps: prevReps
      }));

      return { ...ex, currentSets: updatedSets };
    });

    onUpdateDay({ ...day, exercises: updatedExercises });
    setCopiedExerciseId(exercise.id);
    setTimeout(() => setCopiedExerciseId(null), 2000);
  };

  const handleApplySuggestedWeight = (exerciseId: string, weight: number) => {
    const updatedExercises = day.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const updatedSets = ex.currentSets.map(s => ({
        ...s,
        weight: weight
      }));
      return { ...ex, currentSets: updatedSets };
    });

    onUpdateDay({ ...day, exercises: updatedExercises });
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-blue-600/10 text-blue-400 border border-blue-500/30 uppercase tracking-wide">
                {day.dayName}
              </span>
              <h2 className="text-xl font-semibold text-white tracking-tight">{day.title}</h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-white/40">Músculos clave:</span>
              {day.focusMuscles.map((m, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/70 border border-white/10">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              id="btn-open-rest-timer"
              onClick={onOpenRestTimer}
              className="inline-flex items-center px-3.5 py-2 text-xs font-medium rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
            >
              <Timer className="w-4 h-4 mr-2 text-blue-400" />
              Cronómetro de Descanso
            </button>

            <button
              id="btn-add-exercise"
              onClick={onAddExerciseClick}
              className="inline-flex items-center px-3.5 py-2 text-xs font-medium rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Agregar Ejercicio
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
            <span className="text-white/60">Progreso de la sesión: {completedSetsCount} / {totalSetsCount} series completadas</span>
            <span className="text-blue-400 font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#0a0a0a] rounded-full h-2 overflow-hidden border border-white/10">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Exercises Cards List */}
      <div className="space-y-5">
        {day.exercises.map((exercise, index) => {
          const effectivePrevLog = getMostRecentLogForExercise(exercise, program, day.id);
          const isFullyCompleted = exercise.currentSets.length > 0 && exercise.currentSets.every(s => s.completed);

          return (
            <div
              key={exercise.id}
              className={`bg-[#0f0f0f] border rounded-2xl p-5 shadow-xl transition-all ${
                isFullyCompleted
                  ? 'border-blue-500/50 bg-[#121215]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Exercise Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-3">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg text-xs font-mono font-medium ${
                    isFullyCompleted ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-white/60 border border-white/10'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-white">{exercise.name}</h3>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/10 font-medium">
                        {exercise.muscleGroup}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleJointDiscomfort(exercise.id)}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                          exercise.hasJointDiscomfort
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                            : 'bg-white/5 text-white/40 hover:text-white/70 border-white/10'
                        }`}
                        title={exercise.hasJointDiscomfort ? 'Molestia articular activa (bloquea aumentos de peso)' : 'Marcar si sientes molestia articular en este ejercicio'}
                      >
                        <ShieldAlert className="w-3 h-3 mr-1" />
                        {exercise.hasJointDiscomfort ? 'Molestia Articular' : '¿Molestia?'}
                      </button>
                    </div>

                    <p className="text-xs text-white/50 mt-0.5">
                      Objetivo: <span className="font-medium text-white/80">{exercise.targetSets} series</span> × <span className="font-medium text-white/80">{exercise.targetReps} reps</span>
                    </p>
                  </div>
                </div>

                {/* Right: Last Week Comparison Badge + Compact Overload Advisor Pill */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {effectivePrevLog && (
                    <div className="flex items-center space-x-2 bg-[#0a0a0a] p-2 rounded-xl border border-white/10 shrink-0">
                      <History className="w-4 h-4 text-blue-400" />
                      <div className="text-xs">
                        <span className="text-white/40 block text-[10px]">
                          {effectivePrevLog.isFromCurrentWeek ? 'Sesión previa:' : 'Semana pasada:'}
                        </span>
                        <span className="font-medium text-white font-mono">
                          {effectivePrevLog.weight === 0 ? 'BW' : `${effectivePrevLog.weight} kg`} × {effectivePrevLog.reps} reps
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyPrevData(exercise, effectivePrevLog)}
                        className="ml-1.5 p-1.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg transition-colors flex items-center text-[11px] border border-white/10"
                        title="Copiar datos de última sesión a hoy"
                      >
                        {copiedExerciseId === exercise.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-blue-400 mr-1" />
                            <span className="text-blue-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            <span>Usar peso</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Compact AI Advisor Tag / Pill */}
                  <OverloadAdvisorBadge
                    exercise={exercise}
                    effectivePrevLog={effectivePrevLog}
                    program={program}
                    exerciseIndexInDay={index}
                    isExpanded={!!expandedAdvisorIds[exercise.id]}
                    onToggleExpand={() => toggleAdvisorExpand(exercise.id)}
                  />
                </div>
              </div>

              {/* Collapsible Overload Advisor AI Drawer */}
              {expandedAdvisorIds[exercise.id] && (
                <OverloadAdvisorDrawer
                  key={`${exercise.id}_${effectivePrevLog?.weight ?? 0}_${effectivePrevLog?.reps ?? 0}_${effectivePrevLog?.isFromCurrentWeek ? 'curr' : 'prev'}_${exercise.hasJointDiscomfort ? 'dis' : 'normal'}`}
                  exercise={exercise}
                  effectivePrevLog={effectivePrevLog}
                  program={program}
                  exerciseIndexInDay={index}
                  onApplyWeight={handleApplySuggestedWeight}
                  onClose={() => toggleAdvisorExpand(exercise.id)}
                />
              )}

              {/* Sets Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-white/40 border-b border-white/10 text-[11px] uppercase tracking-wider">
                      <th className="py-2 px-3 w-16">Serie</th>
                      <th className="py-2 px-3">Peso (kg)</th>
                      <th className="py-2 px-3">Repeticiones</th>
                      <th className="py-2 px-3 text-center">Estado</th>
                      <th className="py-2 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {exercise.currentSets.map((setLog) => {
                      const isPR = exercise.previousLogs && setLog.weight > exercise.previousLogs.weight && setLog.completed;

                      return (
                        <tr
                          key={setLog.id}
                          className={`transition-colors ${
                            setLog.completed ? 'bg-blue-600/10' : 'hover:bg-white/5'
                          }`}
                        >
                          {/* Set number */}
                          <td className="py-3 px-3 font-medium text-white/80">
                            Serie {setLog.setNumber}
                            {isPR && (
                              <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-amber-500/20 text-amber-300 rounded font-bold border border-amber-500/30">
                                PR!
                              </span>
                            )}
                          </td>

                          {/* Weight input */}
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-1 max-w-[120px]">
                              <button
                                onClick={() => handleSetChange(exercise.id, setLog.id, 'weight', Math.max(0, setLog.weight - 2.5))}
                                className="w-6 h-6 bg-white/5 hover:bg-white/10 text-white/80 rounded font-bold border border-white/10"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                step="0.5"
                                placeholder="0"
                                value={setLog.weight === 0 ? '' : setLog.weight}
                                onChange={(e) => handleSetChange(exercise.id, setLog.id, 'weight', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                                onFocus={(e) => e.target.select()}
                                className="w-16 bg-[#0a0a0a] border border-white/10 rounded-lg py-1 px-2 text-center text-white font-mono font-medium text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              />
                              <button
                                onClick={() => handleSetChange(exercise.id, setLog.id, 'weight', setLog.weight + 2.5)}
                                className="w-6 h-6 bg-white/5 hover:bg-white/10 text-white/80 rounded font-bold border border-white/10"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Reps input */}
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-1 max-w-[120px]">
                              <button
                                onClick={() => handleSetChange(exercise.id, setLog.id, 'reps', Math.max(1, setLog.reps - 1))}
                                className="w-6 h-6 bg-white/5 hover:bg-white/10 text-white/80 rounded font-bold border border-white/10"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                placeholder="0"
                                value={setLog.reps === 0 ? '' : setLog.reps}
                                onChange={(e) => handleSetChange(exercise.id, setLog.id, 'reps', e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                                onFocus={(e) => e.target.select()}
                                className="w-14 bg-[#0a0a0a] border border-white/10 rounded-lg py-1 px-2 text-center text-white font-mono font-medium text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              />
                              <button
                                onClick={() => handleSetChange(exercise.id, setLog.id, 'reps', setLog.reps + 1)}
                                className="w-6 h-6 bg-white/5 hover:bg-white/10 text-white/80 rounded font-bold border border-white/10"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Completion Toggle */}
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleToggleSetComplete(exercise.id, setLog.id)}
                              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                setLog.completed
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                              }`}
                            >
                              {setLog.completed ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Listo</span>
                                </>
                              ) : (
                                <>
                                  <Circle className="w-4 h-4" />
                                  <span>Pendiente</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Delete Set */}
                          <td className="py-3 px-3 text-right">
                            {exercise.currentSets.length > 1 && (
                              <button
                                onClick={() => handleRemoveSet(exercise.id, setLog.id)}
                                className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
                                title="Eliminar esta serie"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add set button */}
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => handleAddSet(exercise.id)}
                  className="inline-flex items-center text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Agregar otra serie (+1)
                </button>

                <span className="text-[11px] text-white/40">
                  {exercise.currentSets.filter(s => s.completed).length} de {exercise.currentSets.length} series marcadas
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
