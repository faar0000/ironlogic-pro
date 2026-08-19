import { GymProgram, PersonalRecord, HistoryRecord } from '../types';
import { parseToDate, formatLocalDate } from './excelParser';

export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export interface NormalizedDateResult {
  key: string;            // e.g. "2026-08-03" (unique ISO key for grouping)
  timestamp: number;      // e.g. 1785758400000 (strict numerical ordering)
  displayLabel: string;   // e.g. "03/08" (clean label for chart axes)
  fullDisplay: string;    // e.g. "03/08/2026"
}

export function normalizeAnalyticsDate(rawDate?: string | Date): NormalizedDateResult {
  let d: Date | null = null;

  if (rawDate instanceof Date) {
    if (!isNaN(rawDate.getTime())) {
      let year = rawDate.getFullYear();
      if (year === 2025) year = 2026;
      d = new Date(year, rawDate.getMonth(), rawDate.getDate(), 12, 0, 0);
    }
  } else if (typeof rawDate === 'string' && rawDate.trim() !== '') {
    d = parseToDate(rawDate);
  }

  if (!d || isNaN(d.getTime())) {
    const now = new Date();
    d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  }

  const year = d.getFullYear() === 2025 ? 2026 : d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  const dayStr = String(day).padStart(2, '0');
  const monthStr = String(month).padStart(2, '0');
  const key = `${year}-${monthStr}-${dayStr}`;
  const displayLabel = `${dayStr}/${monthStr}`;
  const fullDisplay = `${dayStr}/${monthStr}/${year}`;
  const timestamp = new Date(year, month - 1, day, 12, 0, 0).getTime();

  return { key, timestamp, displayLabel, fullDisplay };
}

export function getPersonalRecords(program: GymProgram): PersonalRecord[] {
  const prMap = new Map<string, PersonalRecord>();

  // Process history
  program.history.forEach(h => {
    const existing = prMap.get(h.exerciseName);
    const estimated1RM = calculate1RM(h.weight, h.reps);
    const { fullDisplay } = normalizeAnalyticsDate(h.date);

    if (!existing || h.weight > existing.maxWeight || (h.weight === existing.maxWeight && h.reps > existing.reps)) {
      prMap.set(h.exerciseName, {
        exerciseName: h.exerciseName,
        muscleGroup: h.muscleGroup,
        maxWeight: h.weight,
        reps: h.reps,
        date: fullDisplay,
        estimated1RM,
      });
    }
  });

  // Also process current completed sets
  program.workoutDays.forEach(day => {
    day.exercises.forEach(ex => {
      ex.currentSets.forEach(s => {
        if (s.completed && s.reps > 0) {
          const existing = prMap.get(ex.name);
          const estimated1RM = calculate1RM(s.weight, s.reps);
          const { fullDisplay } = normalizeAnalyticsDate(new Date());

          if (!existing || s.weight > existing.maxWeight || (s.weight === existing.maxWeight && s.reps > existing.reps)) {
            prMap.set(ex.name, {
              exerciseName: ex.name,
              muscleGroup: ex.muscleGroup,
              maxWeight: s.weight,
              reps: s.reps,
              date: fullDisplay,
              estimated1RM,
            });
          }
        }
      });
    });
  });

  return Array.from(prMap.values()).sort((a, b) => b.maxWeight - a.maxWeight);
}

export interface ExerciseProgressPoint {
  date: string;
  fullDate: string;
  timestamp: number;
  maxWeight: number;
  maxWeightReps: number;
  bestSetWeight: number;
  bestSetReps: number;
  bestSetContext: string;
  totalVolume: number;
  estimated1RM: number;
  relativeStrength1RM: number; // e.g. 1.53 (x BW)
  relativeStrengthMaxWeight: number; // e.g. 1.25 (x BW)
  smoothMaxWeight: number;
  smooth1RM: number;
  smoothRelativeStrength: number;
  sets: { weight: number; reps: number }[];
}

export function getExerciseProgressHistory(
  program: GymProgram,
  exerciseName: string,
  userBodyweight: number = 75
): ExerciseProgressPoint[] {
  const filteredHist = program.history.filter(h => h.exerciseName.toLowerCase() === exerciseName.toLowerCase());
  
  // Group by standardized date ISO key (YYYY-MM-DD)
  const dateMap = new Map<string, { 
    timestamp: number;
    displayLabel: string;
    fullDate: string;
    weights: number[]; 
    volume: number; 
    maxWeight: number; 
    maxWeightReps: number; 
    max1RM: number; 
    best1RMWeight: number; 
    best1RMReps: number; 
    sets: { weight: number; reps: number }[];
  }>();

  filteredHist.forEach(h => {
    const { key, timestamp, displayLabel, fullDisplay } = normalizeAnalyticsDate(h.date);
    const existing = dateMap.get(key) || { 
      timestamp,
      displayLabel,
      fullDate: fullDisplay,
      weights: [], 
      volume: 0, 
      maxWeight: 0, 
      maxWeightReps: 0, 
      max1RM: 0, 
      best1RMWeight: 0, 
      best1RMReps: 0, 
      sets: [] 
    };
    existing.weights.push(h.weight);
    existing.volume += h.weight * h.reps;
    
    if (h.weight > existing.maxWeight || (h.weight === existing.maxWeight && h.reps > existing.maxWeightReps)) {
      existing.maxWeight = h.weight;
      existing.maxWeightReps = h.reps;
    }

    const current1RM = h.estimated1RM || calculate1RM(h.weight, h.reps);
    if (current1RM > existing.max1RM) {
      existing.max1RM = current1RM;
      existing.best1RMWeight = h.weight;
      existing.best1RMReps = h.reps;
    }

    existing.sets.push({ weight: h.weight, reps: h.reps });
    dateMap.set(key, existing);
  });

  // Check previousLogs if not already in dateMap
  program.workoutDays.forEach(day => {
    day.exercises.forEach(ex => {
      if (ex.name.toLowerCase() === exerciseName.toLowerCase() && ex.previousLogs && ex.previousLogs.date) {
        const { key, timestamp, displayLabel, fullDisplay } = normalizeAnalyticsDate(ex.previousLogs.date);
        if (!dateMap.has(key)) {
          const sets = (ex.previousLogs.sets && ex.previousLogs.sets.length > 0)
            ? ex.previousLogs.sets
            : [{ id: 'p-prev', setNumber: 1, weight: ex.previousLogs.weight, reps: ex.previousLogs.reps, completed: true }];

          const existing = {
            timestamp,
            displayLabel,
            fullDate: fullDisplay,
            weights: [] as number[],
            volume: 0,
            maxWeight: 0,
            maxWeightReps: 0,
            max1RM: 0,
            best1RMWeight: 0,
            best1RMReps: 0,
            sets: [] as { weight: number; reps: number }[],
          };

          sets.forEach(s => {
            if (s.weight > 0 || s.reps > 0) {
              existing.weights.push(s.weight);
              existing.volume += s.weight * s.reps;
              if (s.weight > existing.maxWeight || (s.weight === existing.maxWeight && s.reps > existing.maxWeightReps)) {
                existing.maxWeight = s.weight;
                existing.maxWeightReps = s.reps;
              }
              const s1RM = calculate1RM(s.weight, s.reps);
              if (s1RM > existing.max1RM) {
                existing.max1RM = s1RM;
                existing.best1RMWeight = s.weight;
                existing.best1RMReps = s.reps;
              }
              existing.sets.push({ weight: s.weight, reps: s.reps });
            }
          });

          if (existing.weights.length > 0) {
            dateMap.set(key, existing);
          }
        }
      }
    });
  });

  // Check current completed sets for today
  program.workoutDays.forEach(day => {
    day.exercises.forEach(ex => {
      if (ex.name.toLowerCase() === exerciseName.toLowerCase()) {
        const completedSets = ex.currentSets.filter(s => s.completed && s.reps > 0);
        if (completedSets.length > 0) {
          const { key, timestamp, displayLabel, fullDisplay } = normalizeAnalyticsDate(new Date());
          const existing = dateMap.get(key) || { 
            timestamp,
            displayLabel,
            fullDate: fullDisplay,
            weights: [], 
            volume: 0, 
            maxWeight: 0, 
            maxWeightReps: 0, 
            max1RM: 0, 
            best1RMWeight: 0, 
            best1RMReps: 0, 
            sets: [] 
          };
          completedSets.forEach(s => {
            existing.weights.push(s.weight);
            existing.volume += s.weight * s.reps;
            
            if (s.weight > existing.maxWeight || (s.weight === existing.maxWeight && s.reps > existing.maxWeightReps)) {
              existing.maxWeight = s.weight;
              existing.maxWeightReps = s.reps;
            }

            const s1RM = calculate1RM(s.weight, s.reps);
            if (s1RM > existing.max1RM) {
              existing.max1RM = s1RM;
              existing.best1RMWeight = s.weight;
              existing.best1RMReps = s.reps;
            }

            existing.sets.push({ weight: s.weight, reps: s.reps });
          });
          dateMap.set(key, existing);
        }
      }
    });
  });

  const validBw = userBodyweight > 0 ? userBodyweight : 75;

  const sortedPoints: ExerciseProgressPoint[] = Array.from(dateMap.entries())
    .map(([_, val]) => {
      const bestWeight = val.best1RMWeight || val.maxWeight;
      const bestReps = val.best1RMReps || val.maxWeightReps;
      const rel1RM = Math.round((val.max1RM / validBw) * 100) / 100;
      const relMax = Math.round((val.maxWeight / validBw) * 100) / 100;

      return {
        date: val.displayLabel,
        fullDate: val.fullDate,
        timestamp: val.timestamp,
        maxWeight: val.maxWeight,
        maxWeightReps: val.maxWeightReps,
        bestSetWeight: bestWeight,
        bestSetReps: bestReps,
        bestSetContext: `${bestWeight === 0 ? 'BW' : `${bestWeight} kg`} × ${bestReps} reps`,
        totalVolume: val.volume,
        estimated1RM: val.max1RM,
        relativeStrength1RM: rel1RM,
        relativeStrengthMaxWeight: relMax,
        smoothMaxWeight: val.maxWeight,
        smooth1RM: val.max1RM,
        smoothRelativeStrength: rel1RM,
        sets: val.sets,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  // Calculate moving average (rolling window of 3 sessions)
  const windowSize = 3;
  for (let i = 0; i < sortedPoints.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const windowPoints = sortedPoints.slice(start, i + 1);
    const avgWeight = windowPoints.reduce((acc, p) => acc + p.maxWeight, 0) / windowPoints.length;
    const avg1RM = windowPoints.reduce((acc, p) => acc + p.estimated1RM, 0) / windowPoints.length;
    const avgRel = windowPoints.reduce((acc, p) => acc + p.relativeStrength1RM, 0) / windowPoints.length;
    
    sortedPoints[i].smoothMaxWeight = Math.round(avgWeight * 10) / 10;
    sortedPoints[i].smooth1RM = Math.round(avg1RM * 10) / 10;
    sortedPoints[i].smoothRelativeStrength = Math.round(avgRel * 100) / 100;
  }

  return sortedPoints;
}

export function getWeekMondayStr(dateStr: string): string {
  const d = parseToDate(dateStr);
  if (!d || isNaN(d.getTime())) return dateStr;
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday
  d.setDate(d.getDate() + diff);
  return formatLocalDate(d);
}

export interface WeeklyTonnagePoint {
  weekKey: string;       // YYYY-MM-DD of Monday
  weekLabel: string;     // Friendly label e.g. "Sem. 03/08"
  totalTonnage: number;  // Total kg
  totalSets: number;
  totalReps: number;
  isCurrentWeek: boolean;
}

export interface WeeklyComparisonResult {
  weeklyPoints: WeeklyTonnagePoint[];
  currentWeekTonnage: number;       // Accumulated tonnage so far this week
  projectedWeekTonnage: number;     // Projected full-week tonnage
  previousWeekTonnage: number;      // Total tonnage of previous week
  likeForLikePrevTonnage: number;   // Previous week tonnage for ONLY the sessions completed so far
  diffTonnage: number;              // Diff against like-for-like or total
  percentageChange: number;         // % change on like-for-like or projected
  trendStatus: 'INCREASE' | 'DECREASE' | 'EQUAL';
  isWeekIncomplete: boolean;
  completedDaysCount: number;
  totalDaysCount: number;
}

export function getWeeklyTonnageSummary(program: GymProgram): WeeklyComparisonResult {
  const weekMap = new Map<string, { tonnage: number; sets: number; reps: number }>();
  const todayStr = formatLocalDate(new Date());
  const currentWeekMondayStr = getWeekMondayStr(todayStr);

  // 1. Process history records
  program.history.forEach(h => {
    const mondayKey = getWeekMondayStr(h.date);
    const existing = weekMap.get(mondayKey) || { tonnage: 0, sets: 0, reps: 0 };
    const setVol = h.volume && h.volume > 0 ? h.volume : (h.weight * h.reps);
    existing.tonnage += setVol;
    existing.sets += 1;
    existing.reps += h.reps;
    weekMap.set(mondayKey, existing);
  });

  // 2. Process current week completed sets in workoutDays & like-for-like previous logs
  let currentWeekActiveTonnage = 0;
  let currentWeekActiveSets = 0;
  let currentWeekActiveReps = 0;

  let likeForLikePrevTonnage = 0;
  let estimatedRemainingTonnage = 0;

  const trainingDays = program.workoutDays.filter(d => d.dayType === 'training');
  const totalDaysCount = trainingDays.length;
  let completedDaysCount = 0;

  trainingDays.forEach(day => {
    let dayHasCompletedSets = false;
    let dayActiveTonnage = 0;

    day.exercises.forEach(ex => {
      const completedSets = ex.currentSets.filter(s => s.completed && s.weight > 0 && s.reps > 0);
      if (completedSets.length > 0) {
        dayHasCompletedSets = true;

        // Current week actual completed tonnage
        completedSets.forEach(s => {
          const vol = s.weight * s.reps;
          dayActiveTonnage += vol;
          currentWeekActiveSets += 1;
          currentWeekActiveReps += s.reps;
        });

        // Like-for-like previous week tonnage for this same exercise
        if (ex.previousLogs && ex.previousLogs.weight > 0 && ex.previousLogs.reps > 0) {
          const targetSets = ex.targetSets || 3;
          likeForLikePrevTonnage += ex.previousLogs.weight * ex.previousLogs.reps * targetSets;
        }
      } else {
        // Exercise not yet done this week -> estimate for projected week total
        const weightToUse = ex.previousLogs?.weight || (ex.currentSets[0]?.weight > 0 ? ex.currentSets[0].weight : 0);
        const repsToUse = ex.previousLogs?.reps || (ex.currentSets[0]?.reps > 0 ? ex.currentSets[0].reps : 10);
        const targetSets = ex.targetSets || 3;
        estimatedRemainingTonnage += weightToUse * repsToUse * targetSets;
      }
    });

    if (dayHasCompletedSets) {
      completedDaysCount += 1;
      currentWeekActiveTonnage += dayActiveTonnage;
    }
  });

  // Merge active completed sets into current week map
  const currentWeekEntry = weekMap.get(currentWeekMondayStr) || { tonnage: 0, sets: 0, reps: 0 };
  const finalCurrentTonnage = Math.max(currentWeekEntry.tonnage, currentWeekActiveTonnage);
  const finalCurrentSets = Math.max(currentWeekEntry.sets, currentWeekActiveSets);
  const finalCurrentReps = Math.max(currentWeekEntry.reps, currentWeekActiveReps);

  if (finalCurrentTonnage > 0) {
    weekMap.set(currentWeekMondayStr, {
      tonnage: finalCurrentTonnage,
      sets: finalCurrentSets,
      reps: finalCurrentReps,
    });
  }

  // 3. Fallback for Previous Week if history is empty or missing previous week
  const prevMondayD = parseToDate(currentWeekMondayStr) || new Date();
  prevMondayD.setDate(prevMondayD.getDate() - 7);
  const prevWeekMondayStr = formatLocalDate(prevMondayD);

  if (!weekMap.has(prevWeekMondayStr)) {
    let estimatedPrevTonnage = 0;
    let estimatedPrevSets = 0;
    let estimatedPrevReps = 0;

    program.workoutDays.forEach(day => {
      day.exercises.forEach(ex => {
        if (ex.previousLogs && ex.previousLogs.weight > 0 && ex.previousLogs.reps > 0) {
          const setsCount = ex.targetSets || 3;
          estimatedPrevTonnage += ex.previousLogs.weight * ex.previousLogs.reps * setsCount;
          estimatedPrevSets += setsCount;
          estimatedPrevReps += ex.previousLogs.reps * setsCount;
        }
      });
    });

    if (estimatedPrevTonnage > 0) {
      weekMap.set(prevWeekMondayStr, {
        tonnage: estimatedPrevTonnage,
        sets: estimatedPrevSets,
        reps: estimatedPrevReps,
      });
    }
  }

  // 4. Sort weeks chronologically
  const sortedMondayKeys = Array.from(weekMap.keys()).sort(
    (a, b) => (parseToDate(a)?.getTime() || 0) - (parseToDate(b)?.getTime() || 0)
  );

  const weeklyPoints: WeeklyTonnagePoint[] = sortedMondayKeys.map(key => {
    const data = weekMap.get(key)!;
    const isCurrent = key === currentWeekMondayStr;

    const [y, m, d] = key.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const monthShort = dateObj.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
    const weekLabel = isCurrent
      ? 'Esta Semana'
      : `Sem. ${d} ${monthShort}`;

    return {
      weekKey: key,
      weekLabel,
      totalTonnage: Math.round(data.tonnage),
      totalSets: data.sets,
      totalReps: data.reps,
      isCurrentWeek: isCurrent,
    };
  });

  // Calculate comparison values
  const currentPoint = weeklyPoints.find(p => p.isCurrentWeek);
  const currentWeekTonnage = currentPoint ? currentPoint.totalTonnage : 0;
  const projectedWeekTonnage = currentWeekTonnage + Math.round(estimatedRemainingTonnage);

  const prevPointIndex = weeklyPoints.findIndex(p => p.isCurrentWeek) - 1;
  const previousPoint = prevPointIndex >= 0 ? weeklyPoints[prevPointIndex] : weeklyPoints.find(p => p.weekKey === prevWeekMondayStr);
  const previousWeekTonnage = previousPoint ? previousPoint.totalTonnage : 0;

  const isWeekIncomplete = totalDaysCount > 0 && completedDaysCount < totalDaysCount;

  // Decide how to compare diff & percentage:
  // If week is incomplete and we have like-for-like prev tonnage, compare like-for-like!
  // Otherwise compare total vs total or projected vs previous total.
  let comparisonBasePrev = previousWeekTonnage;
  let comparisonCurrent = currentWeekTonnage;

  if (isWeekIncomplete && likeForLikePrevTonnage > 0) {
    comparisonBasePrev = likeForLikePrevTonnage;
    comparisonCurrent = currentWeekTonnage;
  } else if (isWeekIncomplete && projectedWeekTonnage > 0 && previousWeekTonnage > 0) {
    comparisonBasePrev = previousWeekTonnage;
    comparisonCurrent = projectedWeekTonnage;
  }

  const diffTonnage = Math.round(comparisonCurrent - comparisonBasePrev);
  let percentageChange = 0;

  if (comparisonBasePrev > 0) {
    percentageChange = Math.round((diffTonnage / comparisonBasePrev) * 1000) / 10;
  } else if (comparisonCurrent > 0) {
    percentageChange = 100;
  }

  let trendStatus: 'INCREASE' | 'DECREASE' | 'EQUAL' = 'EQUAL';
  if (diffTonnage > 0) trendStatus = 'INCREASE';
  else if (diffTonnage < 0) trendStatus = 'DECREASE';

  return {
    weeklyPoints,
    currentWeekTonnage,
    projectedWeekTonnage,
    previousWeekTonnage,
    likeForLikePrevTonnage: Math.round(likeForLikePrevTonnage),
    diffTonnage,
    percentageChange,
    trendStatus,
    isWeekIncomplete,
    completedDaysCount,
    totalDaysCount,
  };
}

export function getVolumeByMuscleGroup(program: GymProgram) {
  const map = new Map<string, number>();

  program.workoutDays.forEach(day => {
    day.exercises.forEach(ex => {
      const volume = ex.currentSets.reduce((acc, s) => acc + (s.completed ? s.weight * s.reps : 0), 0);
      if (volume > 0) {
        map.set(ex.muscleGroup, (map.get(ex.muscleGroup) || 0) + volume);
      }
    });
  });

  // If current sets have no data yet, aggregate from previous logs
  if (map.size === 0) {
    program.workoutDays.forEach(day => {
      day.exercises.forEach(ex => {
        if (ex.previousLogs) {
          const vol = ex.previousLogs.weight * ex.previousLogs.reps * ex.targetSets;
          map.set(ex.muscleGroup, (map.get(ex.muscleGroup) || 0) + vol);
        }
      });
    });
  }

  return Array.from(map.entries()).map(([muscle, totalVolume]) => ({
    muscle,
    totalVolume,
  }));
}

export interface MuscleEffectiveSets {
  muscle: string;
  completedSets: number;
  plannedWeeklySets: number;
  effectiveSets: number;
  status: 'LOW' | 'OPTIMAL' | 'JUNK_VOLUME';
  statusLabel: string;
  badgeBg: string;
  badgeTextColor: string;
  badgeBorder: string;
  color: string;
  exerciseNames: string[];
}

export function getEffectiveSetsByMuscleGroup(
  program: GymProgram,
  mode: 'completed' | 'planned' | 'auto' = 'auto'
): MuscleEffectiveSets[] {
  const muscleMap = new Map<string, { completedSets: number; plannedWeeklySets: number; exercises: Set<string> }>();

  program.workoutDays.forEach(day => {
    if (day.dayType === 'rest') return;

    day.exercises.forEach(ex => {
      const muscle = ex.muscleGroup?.trim() || 'General';
      const existing = muscleMap.get(muscle) || {
        completedSets: 0,
        plannedWeeklySets: 0,
        exercises: new Set<string>(),
      };

      const planned = ex.targetSets > 0 ? ex.targetSets : (ex.currentSets.length > 0 ? ex.currentSets.length : 3);
      existing.plannedWeeklySets += planned;

      const completed = ex.currentSets.filter(s => s.completed && s.reps > 0).length;
      existing.completedSets += completed;
      existing.exercises.add(ex.name);

      muscleMap.set(muscle, existing);
    });
  });

  // Calculate total completed across all muscles to see if the user has logged sets this week
  let totalCompletedAll = 0;
  muscleMap.forEach(d => {
    totalCompletedAll += d.completedSets;
  });

  return Array.from(muscleMap.entries()).map(([muscle, data]) => {
    let sets = data.completedSets;
    if (mode === 'planned') {
      sets = data.plannedWeeklySets;
    } else if (mode === 'completed') {
      sets = data.completedSets;
    } else {
      // 'auto': if user has logged at least some completed sets, show completed, otherwise planned
      sets = totalCompletedAll > 0 ? data.completedSets : data.plannedWeeklySets;
    }

    let status: 'LOW' | 'OPTIMAL' | 'JUNK_VOLUME' = 'OPTIMAL';
    let statusLabel = 'Rango Óptimo (10 - 20)';
    let color = '#10b981'; // Emerald
    let badgeBg = 'bg-emerald-500/10';
    let badgeTextColor = 'text-emerald-400';
    let badgeBorder = 'border-emerald-500/30';

    if (sets < 10) {
      status = 'LOW';
      statusLabel = 'Volumen Bajo (< 10)';
      color = '#f59e0b'; // Amber
      badgeBg = 'bg-amber-500/10';
      badgeTextColor = 'text-amber-400';
      badgeBorder = 'border-amber-500/30';
    } else if (sets > 20) {
      status = 'JUNK_VOLUME';
      statusLabel = 'Volumen Basura (> 20)';
      color = '#f43f5e'; // Rose
      badgeBg = 'bg-rose-500/10';
      badgeTextColor = 'text-rose-400';
      badgeBorder = 'border-rose-500/30';
    }

    return {
      muscle,
      completedSets: data.completedSets,
      plannedWeeklySets: data.plannedWeeklySets,
      effectiveSets: sets,
      status,
      statusLabel,
      badgeBg,
      badgeTextColor,
      badgeBorder,
      color,
      exerciseNames: Array.from(data.exercises),
    };
  }).sort((a, b) => b.effectiveSets - a.effectiveSets);
}
