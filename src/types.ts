export interface SetLog {
  id: string;
  setNumber: number;
  weight: number; // in kg or lbs
  reps: number;
  completed: boolean;
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string; // e.g., 'Pecho', 'Espalda', 'Pierna', 'Hombros', 'Brazos', 'Core'
  targetSets: number;
  targetReps: string; // e.g., "8-12", "10"
  previousLogs?: {
    date: string; // e.g. "2026-07-28" or "Semana pasada"
    weight: number;
    reps: number;
    sets: SetLog[];
  };
  currentSets: SetLog[];
  notes?: string;
}

export type DayType = 'training' | 'rest';

export interface WorkoutDay {
  id: string;
  dayName: string; // e.g. "Lunes", "Martes", "Día 1", "Día 2"
  dayType: DayType;
  title: string; // e.g., "Empuje (Pecho, Hombro, Tríceps)" or "Descanso Activo"
  focusMuscles: string[];
  exercises: Exercise[];
  completedCount?: number;
  lastCompletedDate?: string;
}

export interface HistoryRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayName: string;
  routineTitle: string;
  exerciseName: string;
  muscleGroup: string;
  setNumber: number;
  weight: number;
  reps: number;
  estimated1RM: number; // calculated weight * (1 + reps/30)
  volume: number; // weight * reps
}

export interface PersonalRecord {
  exerciseName: string;
  muscleGroup: string;
  maxWeight: number;
  reps: number;
  date: string;
  estimated1RM: number;
}

export interface GymProgram {
  fileName: string;
  lastUpdated: string;
  workoutDays: WorkoutDay[];
  history: HistoryRecord[];
}
