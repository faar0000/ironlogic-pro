import * as XLSX from 'xlsx';
import { GymProgram, WorkoutDay, Exercise, SetLog, HistoryRecord, DayType } from '../types';

/**
 * Infer muscle group from exercise name if not explicitly provided
 */
export function inferMuscleGroup(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('banca') || lower.includes('pecho') || lower.includes('apertura') || lower.includes('fondos') || lower.includes('cruce') || lower.includes('chest') || lower.includes('press pectoral')) {
    return 'Pecho';
  }
  if (lower.includes('jalon') || lower.includes('jalón') || lower.includes('remo') || lower.includes('dominada') || lower.includes('espalda') || lower.includes('pull') || lower.includes('lat') || lower.includes('peso muerto')) {
    return 'Espalda';
  }
  if (lower.includes('sentadilla') || lower.includes('prensa') || lower.includes('cuadriceps') || lower.includes('cuádriceps') || lower.includes('zancadas') || lower.includes('hip thrust') || lower.includes('gemelos') || lower.includes('isquio') || lower.includes('pierna') || lower.includes('leg') || lower.includes('pantorrilla') || lower.includes('femoral') || lower.includes('gluteo') || lower.includes('glúteo')) {
    return 'Pierna';
  }
  if (lower.includes('militar') || lower.includes('lateral') || lower.includes('hombro') || lower.includes('deltoides') || lower.includes('face pull') || lower.includes('shoulder') || lower.includes('press arnold')) {
    return 'Hombros';
  }
  if (lower.includes('biceps') || lower.includes('bíceps') || lower.includes('curl') || lower.includes('martillo')) {
    return 'Bíceps';
  }
  if (lower.includes('triceps') || lower.includes('tríceps') || lower.includes('extension') || lower.includes('extensión') || lower.includes('frances') || lower.includes('francés') || lower.includes('copa')) {
    return 'Tríceps';
  }
  if (lower.includes('abs') || lower.includes('crunch') || lower.includes('plancha') || lower.includes('core') || lower.includes('abdominales') || lower.includes('elevacion de piernas')) {
    return 'Core';
  }
  return 'General';
}

const CANONICAL_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const MONTH_MAP: Record<string, number> = {
  ene: 0, jan: 0,
  feb: 1,
  mar: 2,
  abr: 3, apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  ago: 7, aug: 7,
  sep: 8, set: 8,
  oct: 9,
  nov: 10,
  dic: 11, dec: 11,
};

/**
 * Parse any date string / Date object / Excel serial into a JS Date
 */
export function parseToDate(val: any, fallbackYear = new Date().getFullYear()): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val === 'number') {
    const dateObj = XLSX.SSF.parse_date_code(val);
    if (dateObj) {
      return new Date(dateObj.y, dateObj.m - 1, dateObj.d);
    }
  }
  const str = String(val).trim();
  if (!str) return null;

  // DD/MM or DD/MM/YYYY or DD-MM or DD-MM-YYYY
  const slashDashMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/);
  if (slashDashMatch) {
    const day = parseInt(slashDashMatch[1], 10);
    const month = parseInt(slashDashMatch[2], 10) - 1;
    let year = slashDashMatch[3] ? parseInt(slashDashMatch[3], 10) : fallbackYear;
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // "3-Jun" or "04-Ago" or "3 Jun 2026"
  const textMonthMatch = str.match(/^(\d{1,2})[\s\/\-]([a-zA-ZáéíóúÁÉÍÓÚ]+)(?:[\s\/\-](\d{2,4}))?$/);
  if (textMonthMatch) {
    const day = parseInt(textMonthMatch[1], 10);
    const monthStr = textMonthMatch[2].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 3);
    let year = textMonthMatch[3] ? parseInt(textMonthMatch[3], 10) : fallbackYear;
    if (year < 100) year += 2000;
    if (MONTH_MAP[monthStr] !== undefined) {
      const d = new Date(year, MONTH_MAP[monthStr], day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  const standardMs = Date.parse(str);
  if (!isNaN(standardMs)) {
    const d = new Date(standardMs);
    if (d.getFullYear() > 2000 && d.getFullYear() < 2100) {
      return d;
    }
  }

  return null;
}

function formatDateDisplay(d: Date | null, rawStr?: string): string {
  if (d && !isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  }
  return rawStr || '';
}

function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sun, 1 is Mon, ..., 6 is Sat
  const diff = (day === 0 ? -6 : 1 - day);
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function normalizeDayName(raw: string): string | null {
  if (!raw) return null;
  const l = raw.toLowerCase().trim();
  if (l.includes('lun')) return 'Lunes';
  if (l.includes('mar')) return 'Martes';
  if (l.includes('mié') || l.includes('mie')) return 'Miércoles';
  if (l.includes('jue')) return 'Jueves';
  if (l.includes('vie')) return 'Viernes';
  if (l.includes('sáb') || l.includes('sab')) return 'Sábado';
  if (l.includes('dom')) return 'Domingo';
  if (l === 'día 1' || l === 'dia 1' || l === 'd1' || l === 'day 1') return 'Lunes';
  if (l === 'día 2' || l === 'dia 2' || l === 'd2' || l === 'day 2') return 'Martes';
  if (l === 'día 3' || l === 'dia 3' || l === 'd3' || l === 'day 3') return 'Miércoles';
  if (l === 'día 4' || l === 'dia 4' || l === 'd4' || l === 'day 4') return 'Jueves';
  if (l === 'día 5' || l === 'dia 5' || l === 'd5' || l === 'day 5') return 'Viernes';
  if (l === 'día 6' || l === 'dia 6' || l === 'd6' || l === 'day 6') return 'Sábado';
  if (l === 'día 7' || l === 'dia 7' || l === 'd7' || l === 'day 7') return 'Domingo';
  return null;
}

interface SetRowData {
  exerciseName: string;
  muscleGroup: string;
  targetReps: string;
  weight: number;
  repsRealized: number;
  rir?: number;
  rawDateStr: string;
  dateObj: Date | null;
  rowIndex: number;
}

/**
 * Parse uploaded Excel file binary buffer or ArrayBuffer
 */
export function parseExcelFile(fileData: ArrayBuffer, fileName: string): GymProgram {
  const workbook = XLSX.read(fileData, { type: 'array', cellDates: true });
  const sheetNames = workbook.SheetNames;

  if (!sheetNames || sheetNames.length === 0) {
    throw new Error('El archivo Excel no contiene hojas de cálculo.');
  }

  // Structure to collect data for each canonical day (Lunes -> Domingo)
  const daysData: Record<string, {
    focusMuscles: Set<string>;
    exercisesMap: Map<string, SetRowData[]>;
  }> = {};

  CANONICAL_DAYS.forEach(day => {
    daysData[day] = {
      focusMuscles: new Set<string>(),
      exercisesMap: new Map<string, SetRowData[]>(),
    };
  });

  const history: HistoryRecord[] = [];
  const allParsedDates: Date[] = [];

  sheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return;

    const grid = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
    if (!grid || grid.length === 0) return;

    const cleanGrid = grid
      .map(row => (Array.isArray(row) ? row.map(cell => (cell !== null && cell !== undefined ? String(cell).trim() : '')) : []))
      .filter(row => row.some(cell => cell !== ''));

    if (cleanGrid.length === 0) return;

    // Detect header row and column indexes
    let headerRowIdx = -1;
    let colDate = -1;
    let colDay = -1;
    let colGroup = -1;
    let colEx = -1;
    let colTargetReps = -1;
    let colWeight = -1;
    let colRepsReal = -1;
    let colRIR = -1;

    for (let r = 0; r < Math.min(cleanGrid.length, 15); r++) {
      const row = cleanGrid[r];
      row.forEach((cell, c) => {
        const lower = cell.toLowerCase().trim();
        if (colDate === -1 && (lower.includes('fecha') || lower.includes('date'))) {
          colDate = c;
        }
        if (colDay === -1 && (lower.includes('día') || lower.includes('dia') || lower === 'day')) {
          colDay = c;
          headerRowIdx = r;
        }
        if (colGroup === -1 && (lower.includes('grupo') || lower.includes('músculo') || lower.includes('musculo') || lower.includes('muscle'))) {
          colGroup = c;
        }
        if (colEx === -1 && (lower.includes('ejercicio') || lower.includes('exercise') || lower.includes('nombre') || lower.includes('actividad'))) {
          colEx = c;
          headerRowIdx = r;
        }
        if (colTargetReps === -1 && (lower.includes('meta repeti') || lower.includes('target reps') || lower.includes('repeticiones') || lower === 'reps' || lower.includes('meta reps'))) {
          colTargetReps = c;
        }
        if (colWeight === -1 && (lower.includes('peso (kg)') || lower.includes('peso actual') || lower.includes('peso hoy') || lower === 'peso' || lower.includes('weight') || lower.includes('kg'))) {
          colWeight = c;
        }
        if (colRepsReal === -1 && (lower.includes('reps realizadas') || lower.includes('reps real') || lower.includes('reps hechas') || lower.includes('realizadas'))) {
          colRepsReal = c;
        }
        if (colRIR === -1 && (lower.includes('rir'))) {
          colRIR = c;
        }
      });
      if (colEx !== -1 && colDay !== -1) break;
    }

    if (colEx === -1) {
      for (let c = 0; c < (cleanGrid[0]?.length || 0); c++) {
        const textCount = cleanGrid.filter(row => row[c] && isNaN(Number(row[c])) && row[c].length > 2).length;
        if (textCount > 2) {
          colEx = c;
          break;
        }
      }
      if (colEx === -1) colEx = 0;
    }

    const startRow = headerRowIdx >= 0 ? headerRowIdx + 1 : 0;
    let fallbackDayIndex = 0;

    for (let r = startRow; r < cleanGrid.length; r++) {
      const row = cleanGrid[r];
      const exName = colEx !== -1 ? row[colEx] : '';
      if (!exName || exName.trim() === '') continue;

      const lowerEx = exName.toLowerCase();
      if (lowerEx === 'ejercicio' || lowerEx === 'exercise' || lowerEx === 'nombre' || lowerEx === 'actividad') continue;
      if (lowerEx.includes('descanso') || lowerEx.includes('rest day')) continue;

      // Determine day name
      let rawDay = colDay !== -1 ? row[colDay] : sheetName;
      let dayName = normalizeDayName(rawDay);

      if (!dayName) {
        dayName = CANONICAL_DAYS[fallbackDayIndex % 7];
      } else {
        fallbackDayIndex = CANONICAL_DAYS.indexOf(dayName);
      }

      // Group muscle
      let muscle = colGroup !== -1 && row[colGroup] ? row[colGroup] : inferMuscleGroup(exName);
      if (!muscle || muscle === 'General') {
        muscle = inferMuscleGroup(exName);
      }

      // Extract numeric values from row
      let targetRepsStr = '10';
      if (colTargetReps !== -1 && row[colTargetReps]) {
        targetRepsStr = row[colTargetReps];
      }

      let weightVal = 0;
      if (colWeight !== -1 && row[colWeight]) {
        const num = parseFloat(String(row[colWeight]).replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) weightVal = num;
      }

      let repsRealizedVal = 0;
      if (colRepsReal !== -1 && row[colRepsReal]) {
        const num = parseInt(String(row[colRepsReal]), 10);
        if (!isNaN(num)) repsRealizedVal = num;
      }

      const rawDateVal = colDate !== -1 ? row[colDate] : '';
      const dateObj = parseToDate(rawDateVal);

      // Only collect dates for rows that have logged sets or valid date
      if (dateObj) {
        if (weightVal > 0 || repsRealizedVal > 0) {
          allParsedDates.push(dateObj);
        }
      }

      const targetDayObj = daysData[dayName];
      if (targetDayObj) {
        targetDayObj.focusMuscles.add(muscle);

        if (!targetDayObj.exercisesMap.has(exName)) {
          targetDayObj.exercisesMap.set(exName, []);
        }

        targetDayObj.exercisesMap.get(exName)!.push({
          exerciseName: exName,
          muscleGroup: muscle,
          targetReps: targetRepsStr,
          weight: weightVal,
          repsRealized: repsRealizedVal,
          rawDateStr: String(rawDateVal || ''),
          dateObj,
          rowIndex: r,
        });
      }
    }
  });

  // Determine the overall maximum logged date in the file
  let maxLoggedDate: Date = new Date();
  if (allParsedDates.length > 0) {
    maxLoggedDate = new Date(Math.max(...allParsedDates.map(d => d.getTime())));
  }

  // Calculate the Start (Monday 00:00:00) and End (Sunday 23:59:59) of the CURRENT ACTIVE WEEK
  const activeWeekStart = getMondayOfWeek(maxLoggedDate);
  const activeWeekEnd = new Date(activeWeekStart);
  activeWeekEnd.setDate(activeWeekEnd.getDate() + 6);
  activeWeekEnd.setHours(23, 59, 59, 999);

  const activeWeekStartTime = activeWeekStart.getTime();
  const activeWeekEndTime = activeWeekEnd.getTime();

  // Convert daysData into WorkoutDay array (EXACTLY 7 DAYS)
  const workoutDays: WorkoutDay[] = CANONICAL_DAYS.map((dayName, dayIdx) => {
    const dayObj = daysData[dayName];
    const exercises: Exercise[] = [];

    if (dayObj && dayObj.exercisesMap.size > 0) {
      let exIdx = 0;
      dayObj.exercisesMap.forEach((allRowsForEx, exName) => {
        exIdx++;

        // Group rows by session date key or object
        const sessionsMap = new Map<string, { dateObj: Date | null; rawStr: string; rows: SetRowData[] }>();
        allRowsForEx.forEach(r => {
          const key = r.dateObj ? r.dateObj.toISOString().split('T')[0] : (r.rawDateStr || 'default_session');
          if (!sessionsMap.has(key)) {
            sessionsMap.set(key, { dateObj: r.dateObj, rawStr: r.rawDateStr, rows: [] });
          }
          sessionsMap.get(key)!.rows.push(r);
        });

        const allSessions = Array.from(sessionsMap.values());

        // Find session that belongs to the CURRENT ACTIVE WEEK
        const currentWeekSession = allSessions.find(s => {
          if (!s.dateObj) return false;
          const t = s.dateObj.getTime();
          return t >= activeWeekStartTime && t <= activeWeekEndTime;
        });

        // Find previous sessions (prior to active week)
        const previousSessions = allSessions.filter(s => {
          if (!s.dateObj) return true; // fallback
          return s.dateObj.getTime() < activeWeekStartTime;
        });

        // Representative baseline row (for target sets / reps)
        const sampleRow = currentWeekSession?.rows[0] || allSessions[allSessions.length - 1]?.rows[0] || allRowsForEx[0];
        const muscle = sampleRow.muscleGroup || inferMuscleGroup(exName);
        const targetSetsCount = currentWeekSession?.rows.length || sampleRow ? (allRowsForEx.length > 0 ? (currentWeekSession?.rows.length || allSessions[allSessions.length - 1]?.rows.length || 3) : 3) : 3;
        const targetRepsStr = sampleRow.targetReps || '10';

        // 1. Build currentSets for TODAY'S WORKOUT VIEW
        const currentSets: SetLog[] = [];

        if (currentWeekSession) {
          // This day WAS performed in the active week (e.g., Lunes 03/08 or Martes 04/08)
          currentWeekSession.rows.forEach((sRow, setIdx) => {
            const setNumber = setIdx + 1;
            const defaultWeight = sRow.weight > 0 ? sRow.weight : 0;
            const defaultReps = sRow.repsRealized > 0 ? sRow.repsRealized : (parseInt(sRow.targetReps, 10) || 10);
            const isCompleted = sRow.repsRealized > 0 || sRow.weight > 0;

            currentSets.push({
              id: `c-${dayIdx}-${exIdx}-${setNumber}`,
              setNumber,
              weight: defaultWeight,
              reps: defaultReps,
              completed: isCompleted,
            });
          });
        } else {
          // This day HAS NOT been performed in the active week yet (e.g. Miércoles, Jueves, Viernes)
          // Baseline weights/reps come from the latest previous session, but completed = FALSE
          const lastPrevRows = previousSessions.length > 0 ? previousSessions[previousSessions.length - 1].rows : allRowsForEx;
          const numSetsToCreate = lastPrevRows.length || targetSetsCount;

          for (let setIdx = 0; setIdx < numSetsToCreate; setIdx++) {
            const setNumber = setIdx + 1;
            const prevRow = lastPrevRows[setIdx] || lastPrevRows[0];
            const defaultWeight = prevRow?.weight > 0 ? prevRow.weight : 0;
            const defaultReps = prevRow?.repsRealized > 0 ? prevRow.repsRealized : (parseInt(prevRow?.targetReps || '10', 10) || 10);

            currentSets.push({
              id: `c-${dayIdx}-${exIdx}-${setNumber}`,
              setNumber,
              weight: defaultWeight,
              reps: defaultReps,
              completed: false, // Active logging session ready for user!
            });
          }
        }

        // 2. Build previousLogs (Historical reference from prior week session)
        let previousLogsData: Exercise['previousLogs'] = undefined;
        const refSession = previousSessions.length > 0
          ? previousSessions[previousSessions.length - 1]
          : (currentWeekSession ? null : allSessions[allSessions.length - 1]);

        if (refSession && refSession.rows.length > 0) {
          const prevSets: SetLog[] = refSession.rows.map((pRow, pIdx) => ({
            id: `p-${dayIdx}-${exIdx}-${pIdx + 1}`,
            setNumber: pIdx + 1,
            weight: pRow.weight || 0,
            reps: pRow.repsRealized || parseInt(pRow.targetReps, 10) || 10,
            completed: true,
          }));

          const maxWeightRow = refSession.rows.reduce((prev, curr) => (curr.weight > prev.weight ? curr : prev), refSession.rows[0]);
          const dateLabel = formatDateDisplay(refSession.dateObj, refSession.rawStr) || 'Semana anterior';

          previousLogsData = {
            date: dateLabel,
            weight: maxWeightRow.weight || 0,
            reps: maxWeightRow.repsRealized || parseInt(maxWeightRow.targetReps, 10) || 10,
            sets: prevSets,
          };
        }

        // 3. Global history records
        allRowsForEx.forEach((rowItem, rIdx) => {
          if (rowItem.weight > 0 || rowItem.repsRealized > 0) {
            const setNumber = (rIdx % (targetSetsCount || 1)) + 1;
            const w = rowItem.weight || 0;
            const r = rowItem.repsRealized || parseInt(rowItem.targetReps, 10) || 10;
            const dStr = rowItem.dateObj
              ? rowItem.dateObj.toISOString().split('T')[0]
              : (rowItem.rawDateStr || new Date().toISOString().split('T')[0]);
            history.push({
              id: `hist-${dayIdx}-${exIdx}-${rIdx}`,
              date: dStr,
              dayName,
              routineTitle: `${dayName} - Rutina`,
              exerciseName: exName,
              muscleGroup: muscle,
              setNumber,
              weight: w,
              reps: r,
              estimated1RM: w > 0 ? Math.round(w * (1 + r / 30) * 10) / 10 : 0,
              volume: w * r,
            });
          }
        });

        exercises.push({
          id: `ex-${dayIdx}-${exIdx}`,
          name: exName,
          muscleGroup: muscle,
          targetSets: currentSets.length,
          targetReps: targetRepsStr,
          previousLogs: previousLogsData,
          currentSets,
        });
      });

      const focusArray = Array.from(dayObj.focusMuscles);
      const titleStr = focusArray.length > 0 ? `Rutina de ${focusArray.join(' / ')}` : `${dayName} - Entrenamiento`;

      return {
        id: `day-${dayIdx + 1}`,
        dayName,
        dayType: 'training' as DayType,
        title: titleStr,
        focusMuscles: focusArray,
        exercises,
      };
    } else {
      // Rest Day
      return {
        id: `day-${dayIdx + 1}`,
        dayName,
        dayType: 'rest' as DayType,
        title: 'Descanso / Recuperación',
        focusMuscles: ['Recuperación'],
        exercises: [],
      };
    }
  });

  const latestDateDisplay = formatDateDisplay(maxLoggedDate);

  return {
    fileName,
    lastUpdated: latestDateDisplay || new Date().toISOString().split('T')[0],
    workoutDays,
    history,
  };
}
