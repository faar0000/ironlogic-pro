export interface OverloadAdvice {
  status: 'INCREASE' | 'MAINTAIN' | 'EVALUATE_FORM';
  title: string;
  badgeText: string;
  badgeBg: string;
  badgeTextColor: string;
  badgeBorder: string;
  message: string;
  suggestedWeight: number;
  incrementText: string;
}

/**
 * Parses target reps string like "8-12", "10", "12-15"
 * Returns the upper target limit for double progression testing.
 */
export function parseTargetReps(targetRepsStr: string): { min: number; max: number } {
  if (!targetRepsStr) return { min: 10, max: 10 };

  const parts = targetRepsStr.split('-').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  if (parts.length === 2) {
    return { min: parts[0], max: parts[1] };
  } else if (parts.length === 1) {
    return { min: parts[0], max: parts[0] };
  }
  return { min: 10, max: 10 };
}

/**
 * Expert Hypertrophy & Progressive Overload Engine
 * Evaluates achieved reps vs target reps based on overload principles.
 */
export function getOverloadRecommendation(
  prevWeight: number,
  achievedReps: number,
  targetRepsStr: string
): OverloadAdvice {
  const { max: targetReps } = parseTargetReps(targetRepsStr);
  const repDiff = targetReps - achievedReps;

  // 1. AUMENTAR CARGA
  // Repeticiones Logradas >= Objetivo de Repeticiones -> Dominio del peso
  if (achievedReps >= targetReps) {
    // Incremento conservador: +1.25 kg a +2.5 kg por lado (+2.5 kg o +5% total)
    const percentInc = prevWeight * 0.05;
    const stepInc = Math.max(2.5, Math.round(percentInc / 2.5) * 2.5);
    const suggestedWeight = Math.round((prevWeight + stepInc) * 2) / 2;

    return {
      status: 'INCREASE',
      title: 'Aumentar Carga',
      badgeText: '🟢 AUMENTAR CARGA',
      badgeBg: 'bg-emerald-500/10',
      badgeTextColor: 'text-emerald-400',
      badgeBorder: 'border-emerald-500/30',
      message: `¡Dominaste el peso anterior! Lograste ${achievedReps} reps (Objetivo: ${targetReps}). Tu musculatura está lista para sobrecarga.`,
      suggestedWeight,
      incrementText: `Sugerencia: +${stepInc} kg total (+${(stepInc/2).toFixed(2)} kg por lado). Nuevo objetivo: ${suggestedWeight} kg.`,
    };
  }

  // 2. MANTENER CARGA
  // Repeticiones Logradas < Objetivo, pero margen pequeño (1 a 2 reps de diferencia)
  if (repDiff >= 1 && repDiff <= 2) {
    return {
      status: 'MAINTAIN',
      title: 'Mantener Carga',
      badgeText: '🟡 MANTENER CARGA',
      badgeBg: 'bg-amber-500/10',
      badgeTextColor: 'text-amber-300',
      badgeBorder: 'border-amber-500/30',
      message: `Quedaste a solo ${repDiff} repetición(es) del objetivo (${achievedReps} de ${targetReps} reps).`,
      suggestedWeight: prevWeight,
      incrementText: `Mantén ${prevWeight} kg hoy. Tu meta de esta sesión es completar las ${repDiff} rep(s) faltantes con la misma carga.`,
    };
  }

  // 3. EVALUAR TÉCNICA / MANTENER O BAJAR
  // Repeticiones Logradas muy por debajo del objetivo (3 o más reps de diferencia)
  const percentDec = prevWeight * 0.05;
  const suggestedWeightDeload = Math.max(0, Math.round((prevWeight - Math.max(2.5, Math.round(percentDec / 2.5) * 2.5)) * 2) / 2);

  return {
    status: 'EVALUATE_FORM',
    title: 'Evaluar Técnica / Mantener o Bajar',
    badgeText: '🔴 EVALUAR TÉCNICA / MANTENER O BAJAR',
    badgeBg: 'bg-rose-500/10',
    badgeTextColor: 'text-rose-400',
    badgeBorder: 'border-rose-500/30',
    message: `Lograste ${achievedReps} reps, quedando ${repDiff} reps por debajo del objetivo (${targetReps} reps).`,
    suggestedWeight: prevWeight,
    incrementText: `Prioriza el tiempo bajo tensión y la ejecución técnica pulida. Mantén ${prevWeight} kg o reduce a ${suggestedWeightDeload} kg si hay fatiga acumulada.`,
  };
}
