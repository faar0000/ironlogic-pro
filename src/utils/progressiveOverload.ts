import { GymProgram, Exercise, SetLog } from '../types';

export interface OverloadAdvice {
  status: 'INCREASE' | 'MAINTAIN' | 'EVALUATE_FORM' | 'JOINT_ALERT' | 'STAGNATION';
  title: string;
  badgeText: string;
  badgeBg: string;
  badgeTextColor: string;
  badgeBorder: string;
  message: string;
  suggestedWeight: number;
  incrementText: string;
  isIsolation?: boolean;
  isStagnant?: boolean;
  hasIntraSetFatigue?: boolean;
  isPreFatiguedByOrder?: boolean;
  hasJointDiscomfort?: boolean;
  reasonBadges?: string[];
}

export interface ExerciseLogRef {
  weight: number;
  reps: number;
  isFromCurrentWeek?: boolean;
  sets?: SetLog[];
}

export interface OverloadContext {
  exercise?: Exercise;
  program?: GymProgram;
  exerciseIndexInDay?: number;
  recentSets?: SetLog[];
}

/**
 * Detects if an exercise is isolation (monoarticular) or compound (multiarticular)
 */
export function isIsolationExercise(exerciseName: string, muscleGroup?: string): boolean {
  const name = exerciseName.toLowerCase();
  const muscle = (muscleGroup || '').toLowerCase();

  const isolationKeywords = [
    'vuelo', 'elevacion', 'elevación', 'lateral', 'curl', 'extension', 'extensión',
    'patada', 'martillo', 'pec deck', 'pecdeck', 'apertura', 'pullover',
    'encogimiento', 'crunch', 'pantorrilla', 'isquiotibial', 'femoral',
    'gemelo', 'triceps', 'tríceps', 'biceps', 'bíceps', 'anteabrazo', 'concentrado'
  ];

  return isolationKeywords.some(kw => name.includes(kw) || muscle.includes(kw));
}

/**
 * Checks history to detect medium-term stagnation (3+ consecutive weeks stuck at same weight & reps)
 */
export function checkStagnation(
  exerciseName: string,
  program?: GymProgram
): { isStagnant: boolean; sessionsStuckCount: number } {
  if (!program || !program.history || program.history.length === 0) {
    return { isStagnant: false, sessionsStuckCount: 0 };
  }

  const nameTrimmed = exerciseName.trim().toLowerCase();
  const logsForEx = program.history.filter(
    h => h.exerciseName.trim().toLowerCase() === nameTrimmed
  );

  if (logsForEx.length < 3) {
    return { isStagnant: false, sessionsStuckCount: 0 };
  }

  // Group logs by date to get max weight & max reps per session
  const sessionMap = new Map<string, { maxWeight: number; maxReps: number }>();
  logsForEx.forEach(h => {
    const existing = sessionMap.get(h.date) || { maxWeight: 0, maxReps: 0 };
    if (h.weight > existing.maxWeight || (h.weight === existing.maxWeight && h.reps > existing.maxReps)) {
      sessionMap.set(h.date, { maxWeight: h.weight, maxReps: h.reps });
    }
  });

  const sortedSessions = Array.from(sessionMap.entries())
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .map(e => e[1]);

  if (sortedSessions.length < 3) {
    return { isStagnant: false, sessionsStuckCount: 0 };
  }

  // Check last 3 sessions
  const s1 = sortedSessions[0];
  const s2 = sortedSessions[1];
  const s3 = sortedSessions[2];

  const sameWeight = s1.maxWeight === s2.maxWeight && s2.maxWeight === s3.maxWeight && s1.maxWeight > 0;
  const sameReps = Math.abs(s1.maxReps - s2.maxReps) <= 1 && Math.abs(s2.maxReps - s3.maxReps) <= 1;

  if (sameWeight && sameReps) {
    return { isStagnant: true, sessionsStuckCount: 3 };
  }

  return { isStagnant: false, sessionsStuckCount: 0 };
}

/**
 * Finds the most recent completed performance for a given exercise across all days in the program.
 */
export function getMostRecentLogForExercise(
  exercise: Exercise,
  program?: GymProgram,
  currentDayId?: string
): ExerciseLogRef | undefined {
  if (program && program.workoutDays) {
    let latestCurrentWeekPerformance: { weight: number; reps: number; sets?: SetLog[] } | null = null;

    for (const day of program.workoutDays) {
      if (currentDayId && day.id === currentDayId) continue;

      for (const ex of day.exercises) {
        if (ex.name.trim().toLowerCase() === exercise.name.trim().toLowerCase()) {
          const completedSets = ex.currentSets.filter((s) => s.completed && (s.weight > 0 || s.reps > 0));
          if (completedSets.length > 0) {
            const bestSet = completedSets.reduce((prev, curr) => {
              if (curr.weight > prev.weight) return curr;
              if (curr.weight === prev.weight && curr.reps > prev.reps) return curr;
              return prev;
            }, completedSets[0]);

            latestCurrentWeekPerformance = {
              weight: bestSet.weight,
              reps: bestSet.reps,
              sets: completedSets,
            };
          }
        }
      }
    }

    if (latestCurrentWeekPerformance) {
      return {
        ...latestCurrentWeekPerformance,
        isFromCurrentWeek: true,
      };
    }
  }

  // Fallback to exercise.previousLogs
  if (exercise.previousLogs) {
    return {
      weight: exercise.previousLogs.weight,
      reps: exercise.previousLogs.reps,
      isFromCurrentWeek: false,
      sets: exercise.previousLogs.sets,
    };
  }

  return undefined;
}

/**
 * Parses target reps string like "8-12", "10", "12-15"
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
 * Expert Hypertrophy & Intelligent Progressive Overload Engine
 * Evaluates performance considering:
 * 1. Joint discomfort / Red flag alerts
 * 2. Medium-term 3-week stagnation
 * 3. Intra-set fatigue & rep drop-off
 * 4. Exercise position in workout (Pre-fatigue)
 * 5. Compound vs. Isolation micro-increments
 */
export function getOverloadRecommendation(
  prevWeight: number,
  achievedReps: number,
  targetRepsStr: string,
  context?: OverloadContext
): OverloadAdvice {
  const { max: targetRepsMax } = parseTargetReps(targetRepsStr);
  const exercise = context?.exercise;
  const program = context?.program;
  const exerciseName = exercise?.name || '';
  const muscleGroup = exercise?.muscleGroup || '';
  const exerciseIndex = context?.exerciseIndexInDay ?? 0;
  const recentSets = context?.recentSets || exercise?.currentSets || exercise?.previousLogs?.sets || [];

  const reasonBadges: string[] = [];

  // 1. RULE 5: JOINT DISCOMFORT / RED FLAG
  if (exercise?.hasJointDiscomfort) {
    reasonBadges.push('🛡️ Alerta Articular');
    return {
      status: 'JOINT_ALERT',
      title: 'Protección Articular Activada',
      badgeText: '🛡️ ALERTA ARTICULAR / MANTENER O DISMINUIR',
      badgeBg: 'bg-rose-500/10',
      badgeTextColor: 'text-rose-400',
      badgeBorder: 'border-rose-500/30',
      message: `Hay una molestia articular registrada en este ejercicio. Se han bloqueado las cargas para proteger tus ligamentos y tendones.`,
      suggestedWeight: prevWeight,
      incrementText: `Recomendación: Trabaja con ${prevWeight} kg o reduce a ${(prevWeight * 0.85).toFixed(1)} kg en rango de 15-20 reps con tempo excéntrico controlado (3 seg bajada).`,
      hasJointDiscomfort: true,
      reasonBadges,
    };
  }

  // 2. RULE 4: ISOLATION VS COMPOUND
  const isIsolation = isIsolationExercise(exerciseName, muscleGroup);
  reasonBadges.push(isIsolation ? 'Monoarticular / Aislamiento' : 'Multiarticular / Compuesto');

  // 3. RULE 3: EXERCISE POSITION / CUMULATIVE FATIGUE
  const isPreFatiguedByOrder = exerciseIndex >= 3;
  if (isPreFatiguedByOrder) {
    reasonBadges.push(`Posición #${exerciseIndex + 1} (Fatiga previa)`);
  }

  // 4. RULE 1: INTRA-SET FATIGUE ANALYSIS
  let hasIntraSetFatigue = false;
  const completedSets = recentSets.filter(s => s.reps > 0);
  if (completedSets.length > 1) {
    const firstSetReps = completedSets[0].reps;
    const lastSetReps = completedSets[completedSets.length - 1].reps;
    const avgReps = completedSets.reduce((sum, s) => sum + s.reps, 0) / completedSets.length;

    // High drop-off e.g. 12 -> 8 (dropped 3+ reps) or average reps fell short of target
    if (firstSetReps >= targetRepsMax && (lastSetReps <= targetRepsMax - 3 || avgReps < targetRepsMax - 1.5)) {
      hasIntraSetFatigue = true;
      reasonBadges.push('Fatiga Intra-serie Alta');
    }
  }

  // 5. RULE 2: MEDIUM-TERM STAGNATION (3+ WEEKS)
  const stagnationInfo = checkStagnation(exerciseName, program);
  const isStagnant = stagnationInfo.isStagnant;
  if (isStagnant) {
    reasonBadges.push('⚡ Estancamiento (3+ semanas)');
  }

  // -------------------------------------------------------------
  // DECISION TREE
  // -------------------------------------------------------------

  // SCENARIO A: STAGNATION DETECTED
  if (isStagnant && achievedReps <= targetRepsMax) {
    return {
      status: 'STAGNATION',
      title: 'Estancamiento Detectado',
      badgeText: '⚡ ESTANCAMIENTO (3 SEMANAS EN MISMA CARGA)',
      badgeBg: 'bg-amber-500/10',
      badgeTextColor: 'text-amber-300',
      badgeBorder: 'border-amber-500/30',
      message: `Llevas 3+ semanas consecutivas con la misma carga (${prevWeight} kg × ${achievedReps} reps). Subir de peso brusco podría frustrarte o comprometer la técnica.`,
      suggestedWeight: prevWeight,
      incrementText: `Estrategia de desbloqueo: Intenta sumar +1 repetición en la última serie o realizar pausas de 2 segundos en contracción con ${prevWeight} kg antes de dar el salto de carga.`,
      isStagnant: true,
      reasonBadges,
    };
  }

  // SCENARIO B: ACHIEVED TARGET REPS IN SET 1 OR BEST SET
  if (achievedReps >= targetRepsMax) {

    // Sub-case: But intra-set fatigue is high (e.g. 12 - 10 - 8)
    if (hasIntraSetFatigue) {
      return {
        status: 'MAINTAIN',
        title: 'Consolidar Series (Alta Fatiga Intra-serie)',
        badgeText: '🟡 MANTENER CARGA (CONSOLIDAR SERIES)',
        badgeBg: 'bg-amber-500/10',
        badgeTextColor: 'text-amber-300',
        badgeBorder: 'border-amber-500/30',
        message: `Completaste ${achievedReps} reps en la primera serie, pero la fatiga acumulada hizo caer las repeticiones en las series finales.`,
        suggestedWeight: prevWeight,
        incrementText: `Consolida ${targetRepsMax} reps en TODAS las series con ${prevWeight} kg antes de subir carga para evitar lesiones.`,
        hasIntraSetFatigue: true,
        reasonBadges,
      };
    }

    // Sub-case: Success! Green light to INCREASE charge
    let stepInc = 2.5;
    if (isIsolation) {
      // Isolation micro-increment
      stepInc = prevWeight > 0 ? 1.0 : 1.0;
    } else {
      // Compound
      if (isPreFatiguedByOrder) {
        stepInc = 2.5; // Conservative compound jump when fatigued
      } else {
        const percentInc = prevWeight * 0.05;
        stepInc = Math.max(2.5, Math.round(percentInc / 2.5) * 2.5);
      }
    }

    const suggestedWeight = Math.round((prevWeight + stepInc) * 2) / 2;

    let incDescription = `Sugerencia: +${stepInc} kg. Nuevo objetivo: ${suggestedWeight === 0 ? 'BW' : `${suggestedWeight} kg`}.`;
    if (isIsolation) {
      incDescription = `Micro-incremento monoarticular: +${stepInc} kg (${suggestedWeight} kg) para aislar sin perder la forma.`;
    } else if (isPreFatiguedByOrder) {
      incDescription = `Incremento conservador (+${stepInc} kg) al estar en posición #${exerciseIndex + 1} del entrenamiento.`;
    }

    return {
      status: 'INCREASE',
      title: 'Aumentar Carga',
      badgeText: `🟢 AUMENTAR CARGA (+${stepInc} kg)`,
      badgeBg: 'bg-emerald-500/10',
      badgeTextColor: 'text-emerald-400',
      badgeBorder: 'border-emerald-500/30',
      message: `¡Excelente rendimiento! Dominaste las ${achievedReps} reps sin caída drástica de rendimiento entre series.`,
      suggestedWeight,
      incrementText: incDescription,
      isIsolation,
      isPreFatiguedByOrder,
      reasonBadges,
    };
  }

  // SCENARIO C: NEAR TARGET (1 to 2 reps below) -> MAINTAIN
  const repDiff = targetRepsMax - achievedReps;
  if (repDiff >= 1 && repDiff <= 2) {
    return {
      status: 'MAINTAIN',
      title: 'Mantener Carga',
      badgeText: '🟡 MANTENER CARGA',
      badgeBg: 'bg-amber-500/10',
      badgeTextColor: 'text-amber-300',
      badgeBorder: 'border-amber-500/30',
      message: `Quedaste a solo ${repDiff} repetición(es) del objetivo (${achievedReps} de ${targetRepsMax} reps).`,
      suggestedWeight: prevWeight,
      incrementText: `Mantén ${prevWeight === 0 ? 'BW' : `${prevWeight} kg`} hoy. Tu meta es completar las ${repDiff} rep(s) faltantes manteniendo buena técnica.`,
      reasonBadges,
    };
  }

  // SCENARIO D: 3+ REPS BELOW TARGET -> EVALUATE FORM / DELOAD
  const percentDec = prevWeight * 0.05;
  const suggestedWeightDeload = Math.max(0, Math.round((prevWeight - Math.max(2.5, Math.round(percentDec / 2.5) * 2.5)) * 2) / 2);

  return {
    status: 'EVALUATE_FORM',
    title: 'Evaluar Técnica / Mantener o Bajar',
    badgeText: '🔴 EVALUAR TÉCNICA / REDUCIR O MANTENER',
    badgeBg: 'bg-rose-500/10',
    badgeTextColor: 'text-rose-400',
    badgeBorder: 'border-rose-500/30',
    message: `Lograste ${achievedReps} reps, quedando ${repDiff} reps por debajo del objetivo (${targetRepsMax} reps).`,
    suggestedWeight: prevWeight,
    incrementText: `Prioriza el tiempo bajo tensión. Mantén ${prevWeight === 0 ? 'BW' : `${prevWeight} kg`} o reduce a ${suggestedWeightDeload} kg si sientes fatiga muscular acumulada.`,
    reasonBadges,
  };
}

