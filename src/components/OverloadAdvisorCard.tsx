import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Equal, ShieldAlert, Sparkles, Check, ArrowRight, 
  HelpCircle, ChevronDown, ChevronUp, X, Lightbulb, Activity
} from 'lucide-react';
import { Exercise, GymProgram } from '../types';
import { getOverloadRecommendation, parseTargetReps, ExerciseLogRef, OverloadAdvice } from '../utils/progressiveOverload';

interface OverloadAdvisorBadgeProps {
  exercise: Exercise;
  effectivePrevLog?: ExerciseLogRef;
  program?: GymProgram;
  exerciseIndexInDay?: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const OverloadAdvisorBadge: React.FC<OverloadAdvisorBadgeProps> = ({
  exercise,
  effectivePrevLog,
  program,
  exerciseIndexInDay,
  isExpanded,
  onToggleExpand,
}) => {
  const baseWeight = effectivePrevLog?.weight ?? exercise.previousLogs?.weight;
  const baseReps = effectivePrevLog?.reps ?? exercise.previousLogs?.reps;

  if (baseWeight === undefined || baseReps === undefined) {
    return (
      <button
        type="button"
        onClick={onToggleExpand}
        className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all shrink-0 ${
          isExpanded
            ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 ring-1 ring-blue-500/30'
            : 'bg-blue-950/30 hover:bg-blue-900/40 text-blue-300 border-blue-500/30'
        }`}
        title="Evaluar carga de hoy con el Asesor IA"
      >
        <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span>Asesor IA</span>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-blue-400/80" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-blue-400/80" />
        )}
      </button>
    );
  }

  const advice = getOverloadRecommendation(baseWeight, baseReps, exercise.targetReps, {
    exercise,
    program,
    exerciseIndexInDay,
    recentSets: effectivePrevLog?.sets || exercise.currentSets,
  });

  const isIncrease = advice.status === 'INCREASE';
  const isMaintain = advice.status === 'MAINTAIN' || advice.status === 'STAGNATION';
  const isAlert = advice.status === 'JOINT_ALERT' || advice.status === 'EVALUATE_FORM';

  let Icon = isIncrease ? TrendingUp : isAlert ? ShieldAlert : Equal;
  let themeStyles = isIncrease
    ? isExpanded
      ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400 ring-1 ring-emerald-500/40'
      : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-500/40'
    : isAlert
    ? isExpanded
      ? 'bg-rose-500/25 text-rose-200 border-rose-400 ring-1 ring-rose-500/40'
      : 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border-rose-500/40'
    : isExpanded
    ? 'bg-amber-500/25 text-amber-200 border-amber-400 ring-1 ring-amber-500/40'
    : 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border-amber-500/40';

  const shortLabel = isIncrease
    ? 'Aumentar'
    : advice.status === 'JOINT_ALERT'
    ? 'Descarga (Molestia)'
    : advice.status === 'EVALUATE_FORM'
    ? 'Evaluar Técnica'
    : 'Mantener';

  const displayWeight = advice.suggestedWeight === 0 ? 'BW' : `${advice.suggestedWeight} kg`;

  return (
    <button
      type="button"
      onClick={onToggleExpand}
      className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all shadow-sm shrink-0 ${themeStyles}`}
      title="Haz clic para ver la explicación del Asesor IA y aplicar peso"
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="font-semibold">{shortLabel}:</span>
      <span className="font-mono font-bold">{displayWeight}</span>
      {isExpanded ? (
        <ChevronUp className="w-3.5 h-3.5 opacity-75 ml-0.5" />
      ) : (
        <ChevronDown className="w-3.5 h-3.5 opacity-75 ml-0.5" />
      )}
    </button>
  );
};

interface OverloadAdvisorDrawerProps {
  exercise: Exercise;
  effectivePrevLog?: ExerciseLogRef;
  program?: GymProgram;
  exerciseIndexInDay?: number;
  onApplyWeight: (exerciseId: string, weight: number) => void;
  onClose: () => void;
}

export const OverloadAdvisorDrawer: React.FC<OverloadAdvisorDrawerProps> = ({
  exercise,
  effectivePrevLog,
  program,
  exerciseIndexInDay,
  onApplyWeight,
  onClose,
}) => {
  const [applied, setApplied] = useState(false);
  const baseWeight = effectivePrevLog?.weight ?? exercise.previousLogs?.weight;
  const baseReps = effectivePrevLog?.reps ?? exercise.previousLogs?.reps;

  const [customPrevWeight, setCustomPrevWeight] = useState<number | ''>(baseWeight ?? '');
  const [customPrevReps, setCustomPrevReps] = useState<number | ''>(baseReps ?? '');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    setCustomPrevWeight(baseWeight ?? '');
    setCustomPrevReps(baseReps ?? '');
  }, [exercise.id, baseWeight, baseReps]);

  const prevWeight = typeof customPrevWeight === 'number' ? customPrevWeight : baseWeight;
  const prevReps = typeof customPrevReps === 'number' ? customPrevReps : baseReps;

  const handleApply = (weight: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onApplyWeight(exercise.id, weight);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  // If no previous logs recorded yet
  if (prevWeight === undefined || prevReps === undefined) {
    return (
      <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-950/20 text-xs overflow-hidden transition-all shadow-lg animate-fadeIn">
        <div className="p-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-blue-500/20">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Asesor IA
            </span>
            <span className="font-semibold text-white">Evaluar carga inicial</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white/40 hover:text-white rounded-lg transition-colors"
            title="Cerrar asesor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 space-y-3">
          <p className="text-white/80 leading-relaxed">
            Ingresa tus repeticiones y peso de la última vez que realizaste este ejercicio para calcular la sobrecarga progresiva sugerida de hoy (Objetivo: <strong className="text-white">{exercise.targetReps} reps</strong>).
          </p>

          <div className="flex flex-wrap items-center gap-3 bg-black/40 p-2.5 rounded-lg border border-white/10">
            <div className="flex items-center space-x-1.5">
              <span className="text-white/50">Peso previo (kg):</span>
              <input
                type="number"
                placeholder="20"
                value={customPrevWeight === 0 ? '' : customPrevWeight}
                onChange={(e) => setCustomPrevWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                onFocus={(e) => e.target.select()}
                className="w-16 bg-[#0a0a0a] border border-white/10 rounded py-1 px-2 text-white font-mono text-xs focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-white/50">Reps previas:</span>
              <input
                type="number"
                placeholder="10"
                value={customPrevReps === 0 ? '' : customPrevReps}
                onChange={(e) => setCustomPrevReps(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                onFocus={(e) => e.target.select()}
                className="w-14 bg-[#0a0a0a] border border-white/10 rounded py-1 px-2 text-white font-mono text-xs focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const advice = getOverloadRecommendation(prevWeight, prevReps, exercise.targetReps, {
    exercise,
    program,
    exerciseIndexInDay,
    recentSets: effectivePrevLog?.sets || exercise.currentSets,
  });

  const isIncrease = advice.status === 'INCREASE';
  const isAlert = advice.status === 'JOINT_ALERT' || advice.status === 'EVALUATE_FORM';
  let Icon = isIncrease ? TrendingUp : isAlert ? ShieldAlert : Equal;

  return (
    <div className={`mb-4 rounded-xl border ${advice.badgeBg} ${advice.badgeBorder} transition-all overflow-hidden shadow-xl animate-fadeIn text-xs`}>
      {/* Drawer Top Bar */}
      <div className="p-3 bg-black/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wide shrink-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Asesor IA
          </span>

          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold ${advice.badgeTextColor} bg-black/60 border border-white/10`}>
            <Icon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span>{advice.badgeText}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick Apply Button */}
          <button
            type="button"
            onClick={(e) => handleApply(advice.suggestedWeight, e)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-md ${
              applied
                ? 'bg-emerald-600 text-white'
                : isIncrease
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : isAlert
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
            title="Aplica este peso a todas las series activas de este ejercicio"
          >
            {applied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Aplicado a series!</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Usar {advice.suggestedWeight === 0 ? 'BW (Peso Corp.)' : `${advice.suggestedWeight} kg`} hoy</span>
              </>
            )}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Ocultar detalle del asesor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="p-3.5 space-y-2.5 bg-black/20">
        {/* Context Consideration Badges */}
        {advice.reasonBadges && advice.reasonBadges.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-white/40 uppercase font-mono font-medium mr-1">Contexto analizado:</span>
            {advice.reasonBadges.map((badge, bIdx) => (
              <span
                key={bIdx}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/80 border border-white/10 flex items-center"
              >
                <Activity className="w-2.5 h-2.5 mr-1 text-blue-400" />
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Reference Log summary */}
        <div className="text-white/90">
          <span className="font-semibold text-white">
            {effectivePrevLog?.isFromCurrentWeek ? 'Sesión previa (esta semana):' : 'Semana pasada:'}
          </span>{' '}
          <span className="font-mono text-white font-bold">{prevWeight === 0 ? 'BW (Peso Corp.)' : `${prevWeight} kg`}</span> × <span className="font-mono text-white font-bold">{prevReps} reps</span>
          <span className="text-white/50 ml-2 font-mono">(Objetivo: {exercise.targetReps} reps)</span>
        </div>

        {/* Detailed Explanation */}
        <p className="text-white/85 leading-relaxed font-medium">
          {advice.message}
        </p>

        {/* Increment / Rule Tip */}
        <div className="flex items-center text-[11px] text-white/70 italic bg-white/5 p-2 rounded-lg border border-white/10">
          <Lightbulb className="w-3.5 h-3.5 mr-1.5 text-amber-400 shrink-0 not-italic" />
          <span>{advice.incrementText}</span>
        </div>

        {/* Manual adjustment toggle */}
        <div className="pt-1 flex justify-between items-center text-[10px]">
          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="text-white/50 hover:text-white underline transition-colors"
          >
            {showCustomInput ? 'Ocultar ajuste manual' : '¿Simular o ajustar datos de referencia?'}
          </button>
          <span className="text-white/40">Toca el botón superior para cerrar</span>
        </div>

        {/* Custom Input override */}
        {showCustomInput && (
          <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap items-center gap-3 bg-black/40 p-2.5 rounded-lg">
            <span className="text-white/60">Simular datos previos:</span>
            <div className="flex items-center space-x-1">
              <span className="text-white/40">Peso (kg):</span>
              <input
                type="number"
                placeholder="0"
                value={customPrevWeight === 0 ? '' : customPrevWeight}
                onChange={(e) => setCustomPrevWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                onFocus={(e) => e.target.select()}
                className="w-16 bg-[#0a0a0a] border border-white/10 rounded py-1 px-2 text-white font-mono text-xs focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-white/40">Reps:</span>
              <input
                type="number"
                placeholder="0"
                value={customPrevReps === 0 ? '' : customPrevReps}
                onChange={(e) => setCustomPrevReps(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                onFocus={(e) => e.target.select()}
                className="w-14 bg-[#0a0a0a] border border-white/10 rounded py-1 px-2 text-white font-mono text-xs focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Backwards compatibility component if used as a self-contained card
export const OverloadAdvisorCard: React.FC<{
  exercise: Exercise;
  effectivePrevLog?: ExerciseLogRef;
  program?: GymProgram;
  exerciseIndexInDay?: number;
  onApplyWeight: (exerciseId: string, weight: number) => void;
}> = ({ exercise, effectivePrevLog, program, exerciseIndexInDay, onApplyWeight }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <OverloadAdvisorBadge
          exercise={exercise}
          effectivePrevLog={effectivePrevLog}
          program={program}
          exerciseIndexInDay={exerciseIndexInDay}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
        />
      </div>
      {isExpanded && (
        <OverloadAdvisorDrawer
          exercise={exercise}
          effectivePrevLog={effectivePrevLog}
          program={program}
          exerciseIndexInDay={exerciseIndexInDay}
          onApplyWeight={onApplyWeight}
          onClose={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};
