import * as XLSX from 'xlsx';
import { GymProgram } from '../types';

export function exportProgramToExcel(program: GymProgram) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Routine & Current Logs
  const routineRows: any[] = [];
  program.workoutDays.forEach(day => {
    if (day.dayType === 'rest') {
      routineRows.push({
        Día: day.dayName,
        Tipo: 'DESCANSO',
        Rutina: day.title,
        'Grupo Muscular': day.focusMuscles.join(', '),
        Ejercicio: 'Día de Descanso / Recuperación Activa',
        'Series Objetivo': '-',
        'Reps Objetivo': '-',
        'Peso Anterior (kg)': '-',
        'Reps Anterior': '-',
        'Peso Hoy (kg)': '-',
        'Reps Hoy': '-',
        Estado: 'Completado'
      });
    } else {
      day.exercises.forEach(ex => {
        const completedSets = ex.currentSets.filter(s => s.completed);
        const avgCurrentWeight = completedSets.length > 0 
          ? (completedSets.reduce((acc, s) => acc + s.weight, 0) / completedSets.length).toFixed(1)
          : (ex.currentSets[0]?.weight || '-');
        
        const avgCurrentReps = completedSets.length > 0 
          ? Math.round(completedSets.reduce((acc, s) => acc + s.reps, 0) / completedSets.length)
          : (ex.currentSets[0]?.reps || '-');

        routineRows.push({
          Día: day.dayName,
          Tipo: 'ENTRENAMIENTO',
          Rutina: day.title,
          'Grupo Muscular': ex.muscleGroup,
          Ejercicio: ex.name,
          'Series Objetivo': ex.targetSets,
          'Reps Objetivo': ex.targetReps,
          'Peso Anterior (kg)': ex.previousLogs?.weight ?? '-',
          'Reps Anterior': ex.previousLogs?.reps ?? '-',
          'Peso Hoy (kg)': avgCurrentWeight,
          'Reps Hoy': avgCurrentReps,
          Estado: completedSets.length === ex.targetSets ? 'Completado' : `${completedSets.length}/${ex.targetSets} series`
        });
      });
    }
  });

  const wsRoutine = XLSX.utils.json_to_sheet(routineRows);
  // Auto column width
  wsRoutine['!cols'] = [
    { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 18 }, { wch: 32 },
    { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 15 }, { wch: 14 },
    { wch: 12 }, { wch: 15 }
  ];
  XLSX.utils.book_append_sheet(wb, wsRoutine, 'Rutina y Progreso');

  // Sheet 2: Detailed History
  const historyRows = program.history.map(h => ({
    Fecha: h.date,
    Día: h.dayName,
    Rutina: h.routineTitle,
    Ejercicio: h.exerciseName,
    'Grupo Muscular': h.muscleGroup,
    'Serie #': h.setNumber,
    'Peso (kg)': h.weight,
    Repeticiones: h.reps,
    '1RM Estimado (kg)': h.estimated1RM,
    'Volumen (kg x reps)': h.volume
  }));

  const wsHistory = XLSX.utils.json_to_sheet(historyRows.length > 0 ? historyRows : [
    { Fecha: new Date().toISOString().split('T')[0], Nota: 'Aún no hay historial de entrenamientos registrado' }
  ]);
  wsHistory['!cols'] = [
    { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 30 }, { wch: 18 },
    { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsHistory, 'Historial Detallado');

  // Write file and trigger download
  const safeName = program.fileName.endsWith('.xlsx') ? program.fileName.replace('.xlsx', '_Actualizado.xlsx') : `${program.fileName}_Actualizado.xlsx`;
  XLSX.writeFile(wb, safeName);
}
