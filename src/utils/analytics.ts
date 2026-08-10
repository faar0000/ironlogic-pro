import { GymProgram, PersonalRecord, HistoryRecord } from '../types';

export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function getPersonalRecords(program: GymProgram): PersonalRecord[] {
  const prMap = new Map<string, PersonalRecord>();

  // Process history
  program.history.forEach(h => {
    const existing = prMap.get(h.exerciseName);
    const estimated1RM = calculate1RM(h.weight, h.reps);

    if (!existing || h.weight > existing.maxWeight || (h.weight === existing.maxWeight && h.reps > existing.reps)) {
      prMap.set(h.exerciseName, {
        exerciseName: h.exerciseName,
        muscleGroup: h.muscleGroup,
        maxWeight: h.weight,
        reps: h.reps,
        date: h.date,
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

          if (!existing || s.weight > existing.maxWeight || (s.weight === existing.maxWeight && s.reps > existing.reps)) {
            prMap.set(ex.name, {
              exerciseName: ex.name,
              muscleGroup: ex.muscleGroup,
              maxWeight: s.weight,
              reps: s.reps,
              date: new Date().toISOString().split('T')[0],
              estimated1RM,
            });
          }
        }
      });
    });
  });

  return Array.from(prMap.values()).sort((a, b) => b.maxWeight - a.maxWeight);
}

export function getExerciseProgressHistory(program: GymProgram, exerciseName: string) {
  const points: { date: string; maxWeight: number; totalVolume: number; estimated1RM: number }[] = [];

  // Gather from history
  const filteredHist = program.history.filter(h => h.exerciseName.toLowerCase() === exerciseName.toLowerCase());
  
  // Group by date
  const dateMap = new Map<string, { weights: number[]; volume: number; maxWeight: number; max1RM: number }>();

  filteredHist.forEach(h => {
    const existing = dateMap.get(h.date) || { weights: [], volume: 0, maxWeight: 0, max1RM: 0 };
    existing.weights.push(h.weight);
    existing.volume += h.weight * h.reps;
    existing.maxWeight = Math.max(existing.maxWeight, h.weight);
    existing.max1RM = Math.max(existing.max1RM, h.estimated1RM);
    dateMap.set(h.date, existing);
  });

  // Check current completed sets for today
  program.workoutDays.forEach(day => {
    day.exercises.forEach(ex => {
      if (ex.name.toLowerCase() === exerciseName.toLowerCase()) {
        const completedSets = ex.currentSets.filter(s => s.completed);
        if (completedSets.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const existing = dateMap.get(today) || { weights: [], volume: 0, maxWeight: 0, max1RM: 0 };
          completedSets.forEach(s => {
            existing.weights.push(s.weight);
            existing.volume += s.weight * s.reps;
            existing.maxWeight = Math.max(existing.maxWeight, s.weight);
            existing.max1RM = Math.max(existing.max1RM, calculate1RM(s.weight, s.reps));
          });
          dateMap.set(today, existing);
        }
      }
    });
  });

  dateMap.forEach((val, date) => {
    points.push({
      date,
      maxWeight: val.maxWeight,
      totalVolume: val.volume,
      estimated1RM: val.max1RM,
    });
  });

  return points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getWeekMondayStr(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
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
  const todayStr = new Date().toISOString().split('T')[0];
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
  const prevMondayDate = new Date(currentWeekMondayStr);
  prevMondayDate.setDate(prevMondayDate.getDate() - 7);
  const prevWeekMondayStr = prevMondayDate.toISOString().split('T')[0];

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
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
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
