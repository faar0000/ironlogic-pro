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
        if (s.completed && s.weight > 0 && s.reps > 0) {
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
