import { GymProgram, HistoryRecord } from '../types';
import { parseToDate, formatLocalDate, deduplicateHistoryRecords } from './excelParser';

/**
 * Find the Monday of the active week represented by the program.
 * It determines this by looking at program.activeWeekMonday, highest date in program.history, or lastUpdated.
 */
export function getProgramActiveMonday(program?: GymProgram): Date {
  if (program?.activeWeekMonday) {
    const d = parseToDate(program.activeWeekMonday);
    if (d && !isNaN(d.getTime())) {
      const day = d.getDay();
      const diff = (day === 0 ? -6 : 1 - day);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff, 12, 0, 0);
    }
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  const day = today.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  today.setDate(today.getDate() + diff);
  return today;
}

/**
 * Synchronize program history with current completed sets in workoutDays.
 * Ensures any completed exercise sets in the active week are recorded as HistoryRecords,
 * strictly preventing duplicate records and preserving prior history from earlier weeks.
 */
export function syncProgramHistory(program: GymProgram): GymProgram {
  const activeMonday = getProgramActiveMonday(program);

  // Generate the 7 date strings (YYYY-MM-DD) for the active week
  const activeWeekDateStrings: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(activeMonday.getFullYear(), activeMonday.getMonth(), activeMonday.getDate() + i, 12, 0, 0);
    activeWeekDateStrings.push(formatLocalDate(d));
  }

  const activeDatesSet = new Set(activeWeekDateStrings);

  // Filter out any records that belong to the active week from existing history
  const priorHistory = (program.history || []).filter(h => {
    if (!h || !h.date) return false;
    return !activeDatesSet.has(h.date);
  });

  const activeWeekHistory: HistoryRecord[] = [];

  // Generate fresh history records for all completed sets in current workoutDays
  program.workoutDays.forEach((day, dayIdx) => {
    const dayDateStr = activeWeekDateStrings[dayIdx] || activeWeekDateStrings[0];

    day.exercises.forEach((ex) => {
      ex.currentSets.forEach((s) => {
        if (s.completed && (s.weight > 0 || s.reps > 0)) {
          const w = s.weight || 0;
          const r = s.reps || 0;
          const est1RM = w > 0 ? Math.round(w * (1 + r / 30) * 10) / 10 : 0;

          activeWeekHistory.push({
            id: `hist-active-${dayDateStr}-${ex.name.trim().toLowerCase().replace(/\s+/g, '-')}-${s.setNumber}`,
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

  const fullHistory = deduplicateHistoryRecords([...priorHistory, ...activeWeekHistory]);

  return {
    ...program,
    activeWeekMonday: formatLocalDate(activeMonday),
    history: fullHistory,
  };
}

export function getCurrentRealMonday(): Date {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  const day = date.getDay(); // 0 is Sun, 1 is Mon, ..., 6 is Sat
  const diff = (day === 0 ? -6 : 1 - day);
  date.setDate(date.getDate() + diff);
  return date;
}

/**
 * Perform a week rollover:
 * 1. Synchronize ending week's completed sets into program.history
 * 2. Advance the active calendar Monday by +7 days
 * 3. Update exercise.previousLogs with the ending week's best completed performance
 * 4. Reset exercise.currentSets completed status to false (keeping weights as base)
 * 5. Update program.activeWeekMonday and lastUpdated to the new week
 */
export function performRollover(program: GymProgram): GymProgram {
  // 1. Sync ending week's completed sets into history
  const syncedProgram = syncProgramHistory(program);
  
  // 2. Identify the active Monday of the ending week
  const currentActiveMonday = getProgramActiveMonday(program);
  
  // 3. Next active Monday is 7 days ahead
  const nextMonday = new Date(
    currentActiveMonday.getFullYear(),
    currentActiveMonday.getMonth(),
    currentActiveMonday.getDate() + 7,
    12,
    0,
    0
  );
  const nextMondayStr = formatLocalDate(nextMonday);

  // 4. Archive ending week's logs into previousLogs & reset currentSets
  const updatedWorkoutDays = syncedProgram.workoutDays.map((day, dayIdx) => {
    const dayDateStr = formatLocalDate(
      new Date(
        currentActiveMonday.getFullYear(),
        currentActiveMonday.getMonth(),
        currentActiveMonday.getDate() + dayIdx,
        12,
        0,
        0
      )
    );

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
          date: dayDateStr,
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
    activeWeekMonday: nextMondayStr,
    workoutDays: updatedWorkoutDays,
    lastUpdated: nextMondayStr,
  };
}

/**
 * Automatically checks if real date has crossed into a new Monday.
 * If so, automatically performs week rollover.
 */
export function checkAndPerformWeeklyRollover(program: GymProgram): { program: GymProgram; rolledOver: boolean } {
  const activeMonday = getProgramActiveMonday(program);
  const currentMonday = getCurrentRealMonday();

  // If current calendar Monday date string is strictly after active program Monday date string
  const activeMondayStr = formatLocalDate(activeMonday);
  const currentMondayStr = formatLocalDate(currentMonday);

  if (currentMondayStr > activeMondayStr) {
    const rolledOverProgram = performRollover(program);
    return { program: rolledOverProgram, rolledOver: true };
  }

  return { program, rolledOver: false };
}

