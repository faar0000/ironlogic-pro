import React, { useState, useEffect } from 'react';
import { TrendingUp, Equal, ShieldAlert, Sparkles, Check, ArrowRight, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Exercise, GymProgram } from '../types';
import { getOverloadRecommendation, parseTargetReps, ExerciseLogRef } from '../utils/progressiveOverload';

interface OverloadAdvisorCardProps {
  exercise: Exercise;
  effectivePrevLog?: ExerciseLogRef;
  program?: GymProgram;
  exerciseIndexInDay?: number;
  onApplyWeight: (exerciseId: string, weight: number) => void;
}

export const OverloadAdvisorCard: React.FC<OverloadAdvisorCardProps> = ({
  exercise,
  effectivePrevLog,
  program,
  exerciseIndexInDay,
  onApplyWeight,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [applied, setApplied] = useState(false);

  const baseWeight = effectivePrevLog?.weight ?? exercise.previousLogs?.weight;
  const baseReps = effectivePrevLog?.reps ?? exercise.previousLogs?.reps;

  const [customPrevWeight, setCustomPrevWeight] = useState<number | ''>(
    baseWeight ?? ''
  );
  const [customPrevReps, setCustomPrevReps] = useState<number | ''>(
    baseReps ?? ''
  );
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    setCustomPrevWeight(baseWeight ?? '');
    setCustomPrevReps(baseReps ?? '');
  }, [exercise.id, baseWeight, baseReps]);

  // If there are previous logs or custom user input
  const prevWeight = typeof customPrevWeight === 'number' ? customPrevWeight : baseWeight;
  const prevReps = typeof customPrevReps === 'number' ? customPrevReps : baseReps;

  const targetRepsInfo = parseTargetReps(exercise.targetReps);

  const handleApply = (weight: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onApplyWeight(exercise.id, weight);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  // Case 1: Has previous logs (or manually entered)
  if (prevWeight !== undefined && prevReps !== undefined) {
    const advice = getOverloadRecommendation(prevWeight, prevReps, exercise.targetReps, {
      exercise,
      program,
      exerciseIndexInDay,
      recentSets: effectivePrevLog?.sets || exercise.currentSets,
    });

    let Icon = TrendingUp;
    if (advice.status === 'MAINTAIN') Icon = Equal;
    if (advice.status === 'EVALUATE_FORM' || advice.status === 'JOINT_ALERT') Icon = ShieldAlert;
    if (advice.status === 'STAGNATION') Icon = Equal;

    return (
      <div className={`mb-4 rounded-xl border ${advice.badgeBg} ${advice.badgeBorder} transition-all overflow-hidden`}>
        {/* Compact Header Bar - Always visible */}
        <div className="p-3 flex flex-wrap items-center justify-between gap-2.5">
          {/* Status Toggle Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-left hover:opacity-90 transition-opacity focus:outline-none group"
            title="Haz clic para desplegar u ocultar los detalles del asesor"
          >
            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-mono font-bold bg-black/50 text-blue-400 border border-blue-500/30 uppercase tracking-wide shrink-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Asesor IA
            </span>

            <span className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-bold ${advice.badgeTextColor} bg-black/50 border border-white/10 group-hover:border-white/30 transition-colors`}>
              <Icon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <span>{advice.badgeText}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 ml-1.5 text-white/60" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-1.5 text-white/60" />
              )}
            </span>
          </button>

          {/* Quick Action Button: Usar X kg hoy */}
          <button
            type="button"
            onClick={(e) => handleApply(advice.suggestedWeight, e)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 shadow-md shrink-0 ${
              applied
                ? 'bg-emerald-600 text-white'
                : advice.status === 'INCREASE'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : advice.status === 'MAINTAIN'
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : advice.status === 'JOINT_ALERT'
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {applied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Aplicado a las series!</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Usar {advice.suggestedWeight === 0 ? 'BW (Peso Corp.)' : `${advice.suggestedWeight} kg`} hoy</span>
              </>
            )}
          </button>
        </div>

        {/* Expanded Details Panel */}
        {isExpanded && (
          <div className="px-3.5 pb-3.5 pt-1.5 border-t border-white/10 space-y-2.5 bg-black/20 text-xs">
            {/* Reason Badges Pill List */}
            {advice.reasonBadges && advice.reasonBadges.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-white/40 uppercase font-mono font-medium mr-1">Contexto considerado:</span>
                {advice.reasonBadges.map((badge, bIdx) => (
                  <span
                    key={bIdx}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/80 border border-white/10"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}

            <div className="text-xs text-white/90">
              <span className="font-semibold text-white">
                {effectivePrevLog?.isFromCurrentWeek ? 'Última sesión (esta semana):' : 'Semana pasada:'}
              </span> {prevWeight === 0 ? 'BW (Peso Corp.)' : `${prevWeight} kg`} × {prevReps} reps
              <span className="text-white/50 ml-2">(Objetivo: {exercise.targetReps} reps)</span>
            </div>

            <p className="text-xs text-white/80 leading-relaxed font-medium">
              {advice.message}
            </p>

            <p className="text-[11px] text-white/60 italic">
              💡 {advice.incrementText}
            </p>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-[10px] text-white/50 hover:text-white underline"
              >
                {showCustomInput ? 'Ocultar ajuste manual' : '¿Ajustar datos de la semana pasada?'}
              </button>
            </div>

            {/* Custom Input override */}
            {showCustomInput && (
              <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs bg-black/40 p-2.5 rounded-lg">
                <span className="text-white/60">Simular o ajustar datos de semana pasada:</span>
                <div className="flex items-center space-x-1">
                  <span className="text-white/40">Peso (kg):</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={customPrevWeight === 0 ? '' : customPrevWeight}
                    onChange={(e) => setCustomPrevWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    onFocus={(e) => e.target.select()}
                    className="w-16 bg-[#0a0a0a] border border-white/10 rounded py-1 px-2 text-white font-mono text-xs"
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-white/40">Reps logradas:</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={customPrevReps === 0 ? '' : customPrevReps}
                    onChange={(e) => setCustomPrevReps(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    onFocus={(e) => e.target.select()}
                    className="w-14 bg-[#0a0a0a] border border-white/10 rounded py-1 px-2 text-white font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Case 2: No previous logs recorded yet -> show starter card to enter last week's performance
  return (
    <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-950/20 text-xs overflow-hidden">
      <div className="p-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-blue-300 hover:text-blue-200 transition-colors text-left"
        >
          <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-semibold">Asesor de Sobrecarga</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            EVALUAR CARGA
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsExpanded(true);
            setShowCustomInput(true);
          }}
          className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/30 font-medium text-xs shrink-0"
        >
          Evaluar carga
        </button>
      </div>

      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1.5 border-t border-blue-500/20 space-y-2">
          <p className="text-white/70">
            Ingresa tus repeticiones y peso de tu último entrenamiento con este ejercicio para recibir la recomendación de carga de hoy (Objetivo: {exercise.targetReps} reps).
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center space-x-1">
              <span className="text-white/50">Peso (kg):</span>
              <input
                type="number"
                placeholder="20"
                value={customPrevWeight === 0 ? '' : customPrevWeight}
                onChange={(e) => setCustomPrevWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                onFocus={(e) => e.target.select()}
                className="w-16 bg-[#0a0a0a] border border-white/10 rounded py-1 px-2 text-white font-mono text-xs"
              />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-white/50">Reps logradas:</span>
              <input
                type="number"
                placeholder="10"
                value={customPrevReps === 0 ? '' : customPrevReps}
                onChange={(e) => setCustomPrevReps(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                onFocus={(e) => e.target.select()}
                className="w-14 bg-[#0a0a0a] border border-white/10 rounded py-1 px-2 text-white font-mono text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

