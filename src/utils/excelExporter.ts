import * as XLSX from 'xlsx';
import { GymProgram } from '../types';
import { parseToDate } from './excelParser';
import { syncProgramHistory, getProgramActiveMonday } from './historySync';

export function exportProgramToExcel(rawProgram: GymProgram) {
  // Synchronize history so all completed sets in current week are included
  const program = syncProgramHistory(rawProgram);
  const activeMonday = getProgramActiveMonday(program);
  const activeStartMs = activeMonday.getTime();

  const wb = XLSX.utils.book_new();

  // Sheet 1: Routine & Current Logs
  const routineRows: any[] = [];
  program.workoutDays.forEach((day, dayIdx) => {
    const dayDateObj = new Date(activeStartMs + dayIdx * 86400000);

    if (day.dayType === 'rest') {
      routineRows.push({
        Fecha: dayDateObj,
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
          ? Number((completedSets.reduce((acc, s) => acc + s.weight, 0) / completedSets.length).toFixed(1))
          : '-';

        const avgCurrentReps = completedSets.length > 0
          ? Math.round(completedSets.reduce((acc, s) => acc + s.reps, 0) / completedSets.length)
          : '-';

        let statusStr = 'Pendiente';
        if (completedSets.length === ex.targetSets && ex.targetSets > 0) {
          statusStr = 'Completado';
        } else if (completedSets.length > 0) {
          statusStr = `${completedSets.length}/${ex.targetSets} series`;
        }

        routineRows.push({
          Fecha: dayDateObj,
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
          Estado: statusStr
        });
      });
    }
  });

  const wsRoutine = XLSX.utils.json_to_sheet(routineRows, { cellDates: true });
  wsRoutine['!cols'] = [
    { wch: 14 }, { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 18 }, { wch: 32 },
    { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 15 }, { wch: 14 },
    { wch: 12 }, { wch: 15 }
  ];
  XLSX.utils.book_append_sheet(wb, wsRoutine, 'Rutina y Progreso');

  // Sheet 2: Detailed History
  const historyRows = program.history.map(h => {
    const parsedDate = parseToDate(h.date);
    const dateObj = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : new Date();

    return {
      Fecha: dateObj,
      Día: h.dayName,
      Rutina: h.routineTitle,
      Ejercicio: h.exerciseName,
      'Grupo Muscular': h.muscleGroup,
      'Serie #': h.setNumber,
      'Peso (kg)': h.weight,
      Repeticiones: h.reps,
      '1RM Estimado (kg)': h.estimated1RM,
      'Volumen (kg x reps)': h.volume
    };
  });

  const wsHistory = XLSX.utils.json_to_sheet(
    historyRows.length > 0
      ? historyRows
      : [{ Fecha: new Date(), Nota: 'Aún no hay historial de entrenamientos registrado' }],
    { cellDates: true }
  );

  wsHistory['!cols'] = [
    { wch: 14 }, { wch: 12 }, { wch: 20 }, { wch: 30 }, { wch: 18 },
    { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsHistory, 'Historial Detallado');

  // Format all Date cells in both worksheets to standard date format 'dd/mm/yyyy'
  [wsRoutine, wsHistory].forEach(ws => {
    Object.keys(ws).forEach(cellRef => {
      if (cellRef.startsWith('!')) return;
      const cell = ws[cellRef];
      if (cell && (cell.t === 'd' || cell.v instanceof Date)) {
        cell.z = 'dd/mm/yyyy';
      }
    });
  });

  // Write file and trigger download
  const safeName = program.fileName.endsWith('.xlsx') ? program.fileName.replace('.xlsx', '_Actualizado.xlsx') : `${program.fileName}_Actualizado.xlsx`;
  XLSX.writeFile(wb, safeName);
}
