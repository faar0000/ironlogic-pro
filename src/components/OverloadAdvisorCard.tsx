import React, { useState } from 'react';
import { TrendingUp, Equal, ShieldAlert, Sparkles, Check, ArrowRight, HelpCircle } from 'lucide-react';
import { Exercise } from '../types';
import { getOverloadRecommendation, parseTargetReps } from '../utils/progressiveOverload';

interface OverloadAdvisorCardProps {
  exercise: Exercise;
  onApplyWeight: (exerciseId: string, weight: number) => void;
}

export const OverloadAdvisorCard: React.FC<OverloadAdvisorCardProps> = ({
  exercise,
  onApplyWeight,
}) => {
  const [applied, setApplied] = useState(false);
  const [customPrevWeight, setCustomPrevWeight] = useState<number | ''>(
    exercise.previousLogs?.weight ?? ''
  );
  const [customPrevReps, setCustomPrevReps] = useState<number | ''>(
    exercise.previousLogs?.reps ?? ''
  );
  const [showCustomInput, setShowCustomInput] = useState(false);

  // If there are previous logs or custom user input
  const prevWeight = typeof customPrevWeight === 'number' ? customPrevWeight : exercise.previousLogs?.weight;
  const prevReps = typeof customPrevReps === 'number' ? customPrevReps : exercise.previousLogs?.reps;

  const targetRepsInfo = parseTargetReps(exercise.targetReps);

  const handleApply = (weight: number) => {
    onApplyWeight(exercise.id, weight);
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  // Case 1: Has previous logs (or manually entered)
  if (prevWeight !== undefined && prevReps !== undefined) {
    const advice = getOverloadRecommendation(prevWeight, prevReps, exercise.targetReps);

    let Icon = TrendingUp;
    if (advice.status === 'MAINTAIN') Icon = Equal;
    if (advice.status === 'EVALUATE_FORM') Icon = ShieldAlert;

    return (
      <div className={`mb-4 p-4 rounded-xl border ${advice.badgeBg} ${advice.badgeBorder} transition-all`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/40 text-blue-400 border border-blue-500/30 uppercase tracking-wide">
                <Sparkles className="w-3 h-3 mr-1" />
                Asesor de Sobrecarga Progresiva
              </span>

              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold ${advice.badgeTextColor} bg-black/40 border border-white/10`}>
                <Icon className="w-3.5 h-3.5 mr-1" />
                {advice.badgeText}
              </span>
            </div>

            <div className="text-xs text-white/90">
              <span className="font-semibold text-white">Semana pasada:</span> {prevWeight} kg × {prevReps} reps
              <span className="text-white/50 ml-2">(Objetivo: {exercise.targetReps} reps)</span>
            </div>

            <p className="text-xs text-white/80 leading-relaxed font-medium">
              {advice.message}
            </p>

            <p className="text-[11px] text-white/60 italic">
              💡 {advice.incrementText}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <button
              onClick={() => handleApply(advice.suggestedWeight)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 shadow-md ${
                applied
                  ? 'bg-emerald-600 text-white'
                  : advice.status === 'INCREASE'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : advice.status === 'MAINTAIN'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {applied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Aplicado a las series!</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Usar {advice.suggestedWeight} kg hoy</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-[10px] text-white/40 hover:text-white/80 underline self-end"
            >
              {showCustomInput ? 'Ocultar ajuste manual' : '¿Ajustar datos de la semana pasada?'}
            </button>
          </div>
        </div>

        {/* Custom Input override */}
        {showCustomInput && (
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs bg-black/30 p-2.5 rounded-lg">
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
    );
  }

  // Case 2: No previous logs recorded yet -> show starter card to enter last week's performance
  return (
    <div className="mb-4 p-3.5 rounded-xl border border-blue-500/20 bg-blue-950/20 text-xs">
      {!showCustomInput ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-blue-300">
            <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong>Evaluación de Sobrecarga:</strong> Ingresa tus repeticiones y peso de la semana pasada para recibir la recomendación de carga de hoy (Objetivo: {exercise.targetReps} reps).
            </span>
          </div>
          <button
            onClick={() => setShowCustomInput(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/30 font-medium shrink-0 self-start sm:self-auto"
          >
            Evaluar carga
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-blue-300">Calculadora de Sobrecarga Progresiva</span>
            <button onClick={() => setShowCustomInput(false)} className="text-white/40 hover:text-white text-[10px]">Cerrar</button>
          </div>
          <p className="text-white/60">Introduce el peso y repeticiones logradas en tu último entrenamiento con este ejercicio:</p>
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
