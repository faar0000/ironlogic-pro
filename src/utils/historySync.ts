import { GymProgram, HistoryRecord } from '../types';
import { parseToDate } from './excelParser';

/**
 * Find the Monday of the active week represented by the program.
 * It determines this by looking at the highest date in program.history or lastUpdated.
 */
export function getProgramActiveMonday(program: GymProgram): Date {
  let maxDateMs = 0;

  if (program.history && program.history.length > 0) {
    program.history.forEach(h => {
      const d = parseToDate(h.date);
      if (d && !isNaN(d.getTime())) {
        if (d.getTime() > maxDateMs) {
          maxDateMs = d.getTime();
        }
      }
    });
  }

  if (maxDateMs === 0 && program.lastUpdated) {
    const d = parseToDate(program.lastUpdated);
    if (d && !isNaN(d.getTime())) {
      maxDateMs = d.getTime();
    }
  }

  const baseDate = maxDateMs > 0 ? new Date(maxDateMs) : new Date();

  // Calculate Monday 00:00:00 of baseDate's week
  const date = new Date(baseDate);
  const day = date.getDay(); // 0 is Sun, 1 is Mon, ..., 6 is Sat
  const diff = (day === 0 ? -6 : 1 - day);
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Synchronize program history with current completed sets in workoutDays.
 * Ensures any completed exercise sets in the active week are recorded as HistoryRecords,
 * preserving prior history from earlier weeks.
 */
export function syncProgramHistory(program: GymProgram): GymProgram {
  const activeMonday = getProgramActiveMonday(program);
  const activeStartMs = activeMonday.getTime();

  // Filter out active week history records from existing history (to avoid duplicate active week entries)
  const priorHistory = (program.history || []).filter(h => {
    const d = parseToDate(h.date);
    if (!d || isNaN(d.getTime())) return true; // keep fallback items
    return d.getTime() < activeStartMs; // keep records strictly prior to current active week
  });

  const activeWeekHistory: HistoryRecord[] = [];

  // Generate fresh history records for all completed sets in current workoutDays
  program.workoutDays.forEach((day, dayIdx) => {
    const dayDate = new Date(activeStartMs + dayIdx * 86400000);
    const dayDateStr = dayDate.toISOString().split('T')[0]; // YYYY-MM-DD

    day.exercises.forEach((ex, exIdx) => {
      ex.currentSets.forEach((s) => {
        if (s.completed && (s.weight > 0 || s.reps > 0)) {
          const w = s.weight || 0;
          const r = s.reps || 0;
          const est1RM = w > 0 ? Math.round(w * (1 + r / 30) * 10) / 10 : 0;

          activeWeekHistory.push({
            id: `hist-active-${dayIdx}-${exIdx}-${s.setNumber}`,
            date: dayDateStr,
            dayName: day.dayName,
            routineTitle: day.title,
            exerciseName: ex.name,
            muscleGroup: ex.muscleGroup,
            setNumber: s.setNumber,
            weight: w,
            reps: r,
            estimated1RM: est1RM,
            volume: w * r,
          });
        }
      });
    });
  });

  const fullHistory = [...priorHistory, ...activeWeekHistory];

  return {
    ...program,
    history: fullHistory,
  };
}

export function getCurrentRealMonday(): Date {
  const date = new Date();
  const day = date.getDay(); // 0 is Sun, 1 is Mon, ..., 6 is Sat
  const diff = (day === 0 ? -6 : 1 - day);
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Perform a week rollover:
 * 1. Synchronize ending week's completed sets into program.history
 * 2. Update exercise.previousLogs with last week's best completed performance
 * 3. Reset exercise.currentSets completed status to false
 * 4. Update program.lastUpdated to today
 */
export function performRollover(program: GymProgram): GymProgram {
  // 1. Sync completed sets into history
  const syncedProgram = syncProgramHistory(program);
  const todayStr = new Date().toISOString().split('T')[0];

  // 2. Archive last week's logs into previousLogs & reset currentSets
  const updatedWorkoutDays = syncedProgram.workoutDays.map((day) => {
    const updatedExercises = day.exercises.map((ex) => {
      const completedSets = ex.currentSets.filter((s) => s.completed && (s.weight > 0 || s.reps > 0));

      let newPreviousLogs = ex.previousLogs;
      if (completedSets.length > 0) {
        // Find best set (highest weight, then highest reps)
        const bestSet = completedSets.reduce((prev, curr) => {
          if (curr.weight > prev.weight) return curr;
          if (curr.weight === prev.weight && curr.reps > prev.reps) return curr;
          return prev;
        }, completedSets[0]);

        newPreviousLogs = {
          weight: bestSet.weight,
          reps: bestSet.reps,
          date: todayStr,
          sets: completedSets,
        };
      }

      const resetSets = ex.currentSets.map((s) => ({
        ...s,
        completed: false,
      }));

      return {
        ...ex,
        previousLogs: newPreviousLogs,
        currentSets: resetSets,
      };
    });

    return {
      ...day,
      exercises: updatedExercises,
    };
  });

  return {
    ...syncedProgram,
    workoutDays: updatedWorkoutDays,
    lastUpdated: todayStr,
  };
}

/**
 * Automatically checks if real date has crossed into a new Monday.
 * If so, automatically performs week rollover.
 */
export function checkAndPerformWeeklyRollover(program: GymProgram): { program: GymProgram; rolledOver: boolean } {
  const activeMondayMs = getProgramActiveMonday(program).getTime();
  const currentMondayMs = getCurrentRealMonday().getTime();

  // If current calendar Monday is strictly after active program Monday
  if (currentMondayMs > activeMondayMs) {
    const rolledOverProgram = performRollover(program);
    return { program: rolledOverProgram, rolledOver: true };
  }

  return { program, rolledOver: false };
}

