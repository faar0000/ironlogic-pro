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
 * Format a Date object to YYYY-MM-DD using local year, month, and day (avoiding UTC timezone drift)
 */
export function formatLocalDate(d: Date): string {
  const year = d.getFullYear() === 2025 ? 2026 : d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Deduplicate history records by Date + Normalized Exercise Name + Set Number.
 * Preserves the best/most complete record and prevents runaway duplicate generation.
 */
export function deduplicateHistoryRecords(history: HistoryRecord[]): HistoryRecord[] {
  if (!history || !Array.isArray(history)) return [];
  const map = new Map<string, HistoryRecord>();

  history.forEach(h => {
    if (!h || !h.exerciseName) return;
    const dateStr = h.date || '';
    const normName = h.exerciseName.trim().toLowerCase();
    const setNum = h.setNumber || 1;
    const key = `${dateStr}__${normName}__${setNum}`;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, h);
    } else {
      // Keep the one with higher weight/reps/estimated1RM or more recent
      const existingScore = (existing.weight || 0) * 1000 + (existing.reps || 0);
      const currentScore = (h.weight || 0) * 1000 + (h.reps || 0);
      if (currentScore >= existingScore) {
        map.set(key, h);
      }
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    const da = a.date || '';
    const db = b.date || '';
    if (da !== db) return da.localeCompare(db);
    return (a.setNumber || 0) - (b.setNumber || 0);
  });
}

/**
 * Parse any date string / Date object / Excel serial into a JS Date safely at local noon (12:00:00)
 */
export function parseToDate(val: any, fallbackYear = 2026): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    let year = val.getFullYear();
    if (year === 2025) year = 2026;
    return new Date(year, val.getMonth(), val.getDate(), 12, 0, 0);
  }
  if (typeof val === 'number') {
    const dateObj = XLSX.SSF.parse_date_code(val);
    if (dateObj) {
      let year = dateObj.y;
      if (year === 2025) year = 2026;
      return new Date(year, dateObj.m - 1, dateObj.d, 12, 0, 0);
    }
  }
  const str = String(val).trim();
  if (!str) return null;

  // YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymdMatch) {
    let year = parseInt(ymdMatch[1], 10);
    if (year === 2025) year = 2026;
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day, 12, 0, 0);
    if (!isNaN(d.getTime())) return d;
  }

  // DD/MM or DD/MM/YYYY or DD-MM or DD-MM-YYYY
  const slashDashMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/);
  if (slashDashMatch) {
    const day = parseInt(slashDashMatch[1], 10);
    const month = parseInt(slashDashMatch[2], 10) - 1;
    let year = slashDashMatch[3] ? parseInt(slashDashMatch[3], 10) : fallbackYear;
    if (year < 100) year += 2000;
    if (year === 2025) year = 2026;
    const d = new Date(year, month, day, 12, 0, 0);
    if (!isNaN(d.getTime())) return d;
  }

  // "3-Jun" or "04-Ago" or "3 Jun 2026"
  const textMonthMatch = str.match(/^(\d{1,2})[\s\/\-]([a-zA-ZáéíóúÁÉÍÓÚ]+)(?:[\s\/\-](\d{2,4}))?$/);
  if (textMonthMatch) {
    const day = parseInt(textMonthMatch[1], 10);
    const monthStr = textMonthMatch[2].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 3);
    let year = textMonthMatch[3] ? parseInt(textMonthMatch[3], 10) : fallbackYear;
    if (year < 100) year += 2000;
    if (year === 2025) year = 2026;
    if (MONTH_MAP[monthStr] !== undefined) {
      const d = new Date(year, MONTH_MAP[monthStr], day, 12, 0, 0);
      if (!isNaN(d.getTime())) return d;
    }
  }

  const standardMs = Date.parse(str);
  if (!isNaN(standardMs)) {
    const raw = new Date(standardMs);
    let year = raw.getFullYear();
    if (year === 2025) year = 2026;
    if (year > 2000 && year < 2100) {
      return new Date(year, raw.getMonth(), raw.getDate(), 12, 0, 0);
    }
  }

  return null;
}

/**
 * Sanitizes all dates in a GymProgram, guaranteeing year 2026 across history and logs,
 * and deduplicating corrupted history records.
 */
export function sanitizeProgramDatesTo2026(program: GymProgram): GymProgram {
  if (!program) return program;

  const fixDateStr = (dateStr?: string): string => {
    if (!dateStr) return '';
    let fixed = dateStr.replace(/2025/g, '2026');
    fixed = fixed.replace(/([\/\-])25$/g, '$12026');
    return fixed;
  };

  const rawCleanHistory = (program.history || []).map(h => ({
    ...h,
    date: fixDateStr(h.date),
  }));

  // Automatically deduplicate history records
  const cleanHistory = deduplicateHistoryRecords(rawCleanHistory);

  const cleanWorkoutDays = (program.workoutDays || []).map(day => ({
    ...day,
    exercises: (day.exercises || []).map(ex => ({
      ...ex,
      previousLogs: ex.previousLogs
        ? {
            ...ex.previousLogs,
            date: fixDateStr(ex.previousLogs.date),
          }
        : undefined,
    })),
  }));

  const cleanLastUpdated = fixDateStr(program.lastUpdated) || formatLocalDate(new Date());
  const cleanActiveWeekMonday = program.activeWeekMonday ? fixDateStr(program.activeWeekMonday) : undefined;
  const cleanFileName = (program.fileName || 'Rutina_Hipertrofia_2026.xlsx').replace(/2025/g, '2026');

  return {
    ...program,
    fileName: cleanFileName,
    activeWeekMonday: cleanActiveWeekMonday,
    lastUpdated: cleanLastUpdated,
    workoutDays: cleanWorkoutDays,
    history: cleanHistory,
  };
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
  routineTitle?: string;
  setNumber?: number;
  targetSets?: number;
  targetReps: string;
  weight: number;
  repsRealized: number;
  rir?: number;
  rawDateStr: string;
  dateObj: Date | null;
  rowIndex: number;
}

/**
 * Clean target reps value, handling Excel formatting issues like:
 * - 810 -> "8-10", default 10
 * - 1012 -> "10-12", default 12
 * - 1215 -> "12-15", default 15
 * - 68 -> "6-8", default 8
 * - 812 -> "8-12", default 12
 * - 1015 -> "10-15", default 15
 * - 1220 -> "12-20", default 15
 * - 1520 -> "15-20", default 20
 * - 155 -> "12-15", default 15
 * - "8-10", "10-12", "12-15", etc.
 * - Excel Date coercion (e.g. Oct 8 parsed as date -> "8-10")
 * - Single numbers: 10, 12, 15, 8, etc.
 */
export function cleanTargetReps(val: any): { display: string; defaultReps: number } {
  if (val === undefined || val === null || val === '') {
    return { display: '10', defaultReps: 10 };
  }

  // Handle JS Date object (e.g., when Excel converted 8-10 or 10-12 to a Date)
  if (val instanceof Date && !isNaN(val.getTime())) {
    const day = val.getDate();
    const month = val.getMonth() + 1; // 1-12
    if (day >= 4 && day <= 25 && month >= 4 && month <= 25) {
      const minR = Math.min(day, month);
      const maxR = Math.max(day, month);
      return { display: `${minR}-${maxR}`, defaultReps: maxR };
    }
  }

  const str = String(val).trim();
  if (!str) return { display: '10', defaultReps: 10 };

  // Explicit range like "8-10", "8 - 10", "8/10", "8 a 10", "8 to 10"
  const rangeMatch = str.match(/^(\d{1,2})\s*[\-\/\saAtoTO]+\s*(\d{1,2})$/i);
  if (rangeMatch) {
    const minR = parseInt(rangeMatch[1], 10);
    const maxR = parseInt(rangeMatch[2], 10);
    if (!isNaN(minR) && !isNaN(maxR)) {
      return { display: `${minR}-${maxR}`, defaultReps: maxR };
    }
  }

  // Handle concatenated numbers created by Excel number formatting without dash:
  const numOnly = str.replace(/[^0-9]/g, '');

  if (numOnly === '810') return { display: '8-10', defaultReps: 10 };
  if (numOnly === '1012') return { display: '10-12', defaultReps: 12 };
  if (numOnly === '1215') return { display: '12-15', defaultReps: 15 };
  if (numOnly === '1520') return { display: '15-20', defaultReps: 20 };
  if (numOnly === '68') return { display: '6-8', defaultReps: 8 };
  if (numOnly === '812') return { display: '8-12', defaultReps: 12 };
  if (numOnly === '1015') return { display: '10-15', defaultReps: 15 };
  if (numOnly === '1220') return { display: '12-20', defaultReps: 15 };
  if (numOnly === '46') return { display: '4-6', defaultReps: 6 };
  if (numOnly === '155' || numOnly === '1515') return { display: '12-15', defaultReps: 15 };

  // Single standard number like "12", "15", "10", "8"
  const singleNum = parseInt(numOnly, 10);
  if (!isNaN(singleNum)) {
    if (singleNum >= 1 && singleNum <= 50) {
      return { display: String(singleNum), defaultReps: singleNum };
    }
    // 3-digit range e.g. 610 -> 6-10, 810 -> 8-10
    if (numOnly.length === 3) {
      const p1 = parseInt(numOnly.substring(0, 1), 10);
      const p2 = parseInt(numOnly.substring(1), 10);
      if (p1 < p2 && p2 <= 30) {
        return { display: `${p1}-${p2}`, defaultReps: p2 };
      }
    } else if (numOnly.length === 4) {
      const p1 = parseInt(numOnly.substring(0, 2), 10);
      const p2 = parseInt(numOnly.substring(2), 10);
      if (p1 < p2 && p2 <= 35) {
        return { display: `${p1}-${p2}`, defaultReps: p2 };
      }
    }
  }

  return { display: str, defaultReps: 10 };
}

function cleanHeaderKey(val: any): string {
  return String(val || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
    routineTitle?: string;
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

    // Detect header row and column indexes across the top rows
    let headerRowIdx = -1;
    let colDate = -1;
    let colDay = -1;
    let colType = -1;
    let colRoutine = -1;
    let colGroup = -1;
    let colEx = -1;
    let colSetNumber = -1;
    let colTargetSets = -1;
    let colTargetReps = -1;
    let colReps = -1;
    let colWeight = -1;
    let colRIR = -1;

    for (let r = 0; r < Math.min(cleanGrid.length, 10); r++) {
      const row = cleanGrid[r];
      row.forEach((cell, c) => {
        const h = cleanHeaderKey(cell);
        if (!h) return;

        if (colDate === -1 && (h.includes('fecha') || h.includes('date'))) {
          colDate = c;
          if (headerRowIdx === -1) headerRowIdx = r;
        }
        if (colDay === -1 && (h.includes('dia') || h === 'day' || h === 'dias' || h.includes('jornada'))) {
          colDay = c;
          if (headerRowIdx === -1) headerRowIdx = r;
        }
        if (colType === -1 && (h.includes('tipo') || h.includes('type'))) {
          colType = c;
        }
        if (colRoutine === -1 && (h.includes('rutina') || h.includes('routine') || h.includes('sesion') || h.includes('nombre rutina'))) {
          colRoutine = c;
        }
        if (colGroup === -1 && (h.includes('grupo') || h.includes('musculo') || h.includes('muscle') || h.includes('zona') || h.includes('categoria'))) {
          colGroup = c;
        }
        if (colEx === -1 && (h.includes('ejercicio') || h.includes('exercise') || h.includes('actividad') || h.includes('movimiento') || h === 'nombre')) {
          colEx = c;
          headerRowIdx = r;
        }
        
        // 1. Target Reps (e.g. Reps Objetivo, Meta Repeticiones)
        if (colTargetReps === -1 && (
          h.includes('reps objetivo') ||
          h.includes('repeticiones objetivo') ||
          h.includes('repeticion objetivo') ||
          h.includes('rep objetivo') ||
          h.includes('meta repeti') ||
          h.includes('target rep') ||
          h.includes('meta reps') ||
          h.includes('reps programada') ||
          h.includes('repeticiones programada') ||
          h.includes('reps meta')
        )) {
          colTargetReps = c;
        }

        // 2. Target sets planned (e.g. Series Objetivo)
        if (colTargetSets === -1 && (
          h.includes('series objetivo') ||
          h.includes('serie objetivo') ||
          h.includes('objetivo serie') ||
          h.includes('series meta') ||
          h.includes('meta serie') ||
          h.includes('series planeada') ||
          h.includes('series programada') ||
          h.includes('target set') ||
          h.includes('sets objetivo') ||
          h.includes('total serie') ||
          h.includes('cant serie') ||
          h.includes('cantidad serie')
        )) {
          colTargetSets = c;
        }

        // 3. Set number for individual row (e.g. Serie #, Serie 1, Set #)
        if (colSetNumber === -1 && (
          h.includes('serie #') ||
          h.includes('set #') ||
          h.includes('n serie') ||
          h.includes('nro serie') ||
          h.includes('num serie') ||
          h.includes('numero serie') ||
          (h === 'serie' && colTargetSets !== c) ||
          (h === 'set' && colTargetSets !== c) ||
          h === 's'
        )) {
          if (colTargetSets !== c) {
            colSetNumber = c;
          }
        }

        // 4. Weight column
        if (colWeight === -1 && (
          h.includes('peso') ||
          h.includes('weight') ||
          h.includes('kg') ||
          h.includes('carga') ||
          h.includes('load')
        )) {
          colWeight = c;
        }

        // 5. Realized Reps (must NOT be an "objetivo" / "meta" column)
        if (colReps === -1 && colTargetReps !== c && !h.includes('objetivo') && !h.includes('meta') && !h.includes('target')) {
          if (
            h.includes('repeticiones realizadas') ||
            h.includes('reps realizadas') ||
            h.includes('repeticiones hechas') ||
            h.includes('reps hechas') ||
            h.includes('reps reales') ||
            h.includes('reps log') ||
            h === 'reps' ||
            h === 'repeticiones' ||
            h === 'rep'
          ) {
            colReps = c;
          }
        }

        if (colRIR === -1 && (h.includes('rir') || h.includes('rpe'))) {
          colRIR = c;
        }
      });
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

      const cleanEx = cleanHeaderKey(exName);
      if (cleanEx === 'ejercicio' || cleanEx === 'exercise' || cleanEx === 'nombre' || cleanEx === 'actividad') continue;
      if (cleanEx.includes('descanso') || cleanEx.includes('rest day')) continue;

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

      // Routine title
      let routineTitle = '';
      if (colRoutine !== -1 && row[colRoutine]) {
        routineTitle = String(row[colRoutine]).trim();
      }

      // Set Number (e.g. Serie #: 1, 2, 3...)
      let setNumberVal: number | undefined = undefined;
      if (colSetNumber !== -1 && row[colSetNumber] !== undefined && row[colSetNumber] !== '') {
        const num = parseInt(String(row[colSetNumber]).replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num) && num > 0) setNumberVal = num;
      }

      // Target Sets (e.g. Series Objetivo: 4)
      let targetSetsVal = 0;
      if (colTargetSets !== -1 && row[colTargetSets]) {
        const num = parseInt(String(row[colTargetSets]).replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num) && num > 0) targetSetsVal = num;
      }

      // Extract numeric weight
      let weightVal = 0;
      if (colWeight !== -1 && row[colWeight] !== undefined && row[colWeight] !== '') {
        const num = parseFloat(String(row[colWeight]).replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) weightVal = num;
      }

      // Extract target reps (e.g. "8-10", "10-12", "12-15", "12", etc.)
      let targetRepsInfo = { display: '10', defaultReps: 10 };
      if (colTargetReps !== -1 && row[colTargetReps] !== undefined && row[colTargetReps] !== '') {
        targetRepsInfo = cleanTargetReps(row[colTargetReps]);
      }

      // Extract reps (only from colReps for realized reps)
      let repsVal = 0;
      if (colReps !== -1 && row[colReps] !== undefined && row[colReps] !== '') {
        const num = parseInt(String(row[colReps]).replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num) && num > 0 && num <= 100) repsVal = num;
      }

      const targetRepsStr = targetRepsInfo.display;

      const rawDateVal = colDate !== -1 ? row[colDate] : '';
      const dateObj = parseToDate(rawDateVal);

      // Only collect dates for rows that have logged sets or valid date
      if (dateObj) {
        if (weightVal > 0 || repsVal > 0) {
          allParsedDates.push(dateObj);
        }
      }

      const targetDayObj = daysData[dayName];
      if (targetDayObj) {
        if (routineTitle && !targetDayObj.routineTitle) {
          targetDayObj.routineTitle = routineTitle;
        }
        targetDayObj.focusMuscles.add(muscle);

        if (!targetDayObj.exercisesMap.has(exName)) {
          targetDayObj.exercisesMap.set(exName, []);
        }

        targetDayObj.exercisesMap.get(exName)!.push({
          exerciseName: exName,
          muscleGroup: muscle,
          routineTitle,
          setNumber: setNumberVal,
          targetSets: targetSetsVal > 0 ? targetSetsVal : undefined,
          targetReps: targetRepsStr,
          weight: weightVal,
          repsRealized: repsVal,
          rawDateStr: String(rawDateVal || ''),
          dateObj,
          rowIndex: r,
        });
      }
    }
  });

  // Determine current active date (today's real calendar date)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);

  // Calculate the Start (Monday 00:00:00) and End (Sunday 23:59:59) of the CURRENT REAL ACTIVE WEEK (HOY)
  const activeWeekStart = getMondayOfWeek(today);
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
        const muscle = sampleRow?.muscleGroup || inferMuscleGroup(exName);
        const targetRepsStr = sampleRow?.targetReps || '10';

        // 1. Determine maximum set number or target sets count
        let maxSetNumberFromRows = 0;
        allRowsForEx.forEach((r, idx) => {
          const sNum = r.setNumber || (idx + 1);
          if (sNum > maxSetNumberFromRows) maxSetNumberFromRows = sNum;
        });

        let explicitTargetSets = 0;
        for (const r of allRowsForEx) {
          if (r.targetSets && r.targetSets > 0) {
            explicitTargetSets = r.targetSets;
            break;
          }
        }

        let targetSetsCount = explicitTargetSets > 0
          ? explicitTargetSets
          : Math.max(
              maxSetNumberFromRows,
              currentWeekSession?.rows.length || 0,
              previousSessions.length > 0 ? previousSessions[previousSessions.length - 1].rows.length : 0,
              1
            );
        targetSetsCount = Math.min(Math.max(targetSetsCount, 1), 10);

        // 2. Build currentSets with EXACT matching by setNumber
        const currentSets: SetLog[] = [];

        for (let setIdx = 0; setIdx < targetSetsCount; setIdx++) {
          const setNumber = setIdx + 1;
          
          // Match row in current week session: first by explicit setNumber, then by array index
          let matchingRow: SetRowData | undefined = undefined;
          if (currentWeekSession && currentWeekSession.rows.length > 0) {
            matchingRow = currentWeekSession.rows.find(r => r.setNumber === setNumber);
            if (!matchingRow && currentWeekSession.rows[setIdx]) {
              matchingRow = currentWeekSession.rows[setIdx];
            }
          }

          // Previous session fallback
          const prevSession = previousSessions.length > 0 ? previousSessions[previousSessions.length - 1] : null;
          let prevMatchingRow: SetRowData | undefined = undefined;
          if (prevSession && prevSession.rows.length > 0) {
            prevMatchingRow = prevSession.rows.find(r => r.setNumber === setNumber) || prevSession.rows[setIdx] || prevSession.rows[0];
          }

          const baseRow = matchingRow || prevMatchingRow || sampleRow;
          const baseTargetInfo = cleanTargetReps(baseRow?.targetReps);

          const defaultWeight = matchingRow ? matchingRow.weight : (prevMatchingRow?.weight || 0);
          const defaultReps = (matchingRow && matchingRow.repsRealized > 0)
            ? matchingRow.repsRealized
            : ((prevMatchingRow && prevMatchingRow.repsRealized > 0)
                ? prevMatchingRow.repsRealized
                : baseTargetInfo.defaultReps);
          const isCompleted = matchingRow ? (matchingRow.weight > 0 || matchingRow.repsRealized > 0) : false;

          currentSets.push({
            id: `c-${dayIdx}-${exIdx}-${setNumber}`,
            setNumber,
            weight: defaultWeight,
            reps: defaultReps,
            completed: isCompleted,
          });
        }

        // 3. Build previousLogs (Historical reference from prior week session)
        let previousLogsData: Exercise['previousLogs'] = undefined;
        const refSession = previousSessions.length > 0
          ? previousSessions[previousSessions.length - 1]
          : (currentWeekSession ? null : allSessions[allSessions.length - 1]);

        if (refSession && refSession.rows.length > 0) {
          const prevSets: SetLog[] = refSession.rows.map((pRow, pIdx) => {
            const pTargetInfo = cleanTargetReps(pRow.targetReps);
            return {
              id: `p-${dayIdx}-${exIdx}-${pRow.setNumber || pIdx + 1}`,
              setNumber: pRow.setNumber || pIdx + 1,
              weight: pRow.weight || 0,
              reps: pRow.repsRealized || pTargetInfo.defaultReps || 10,
              completed: true,
            };
          });

          const maxWeightRow = refSession.rows.reduce((prev, curr) => (curr.weight > prev.weight ? curr : prev), refSession.rows[0]);
          const dateLabel = formatDateDisplay(refSession.dateObj, refSession.rawStr) || 'Semana anterior';

          previousLogsData = {
            date: dateLabel,
            weight: maxWeightRow.weight || 0,
            reps: maxWeightRow.repsRealized || parseInt(maxWeightRow.targetReps, 10) || 10,
            sets: prevSets,
          };
        }

        // 4. Global history records
        allRowsForEx.forEach((rowItem, rIdx) => {
          if (rowItem.weight > 0 || rowItem.repsRealized > 0) {
            const setNumber = rowItem.setNumber || ((rIdx % (targetSetsCount || 1)) + 1);
            const w = rowItem.weight || 0;
            const r = rowItem.repsRealized || parseInt(rowItem.targetReps, 10) || 10;
            const dStr = rowItem.dateObj
              ? rowItem.dateObj.toISOString().split('T')[0]
              : (rowItem.rawDateStr || new Date().toISOString().split('T')[0]);
            history.push({
              id: `hist-${dayIdx}-${exIdx}-${rIdx}`,
              date: dStr,
              dayName,
              routineTitle: dayObj.routineTitle || `${dayName} - Rutina`,
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
          targetSets: targetSetsCount,
          targetReps: targetRepsStr,
          previousLogs: previousLogsData,
          currentSets,
        });
      });

      const focusArray = Array.from(dayObj.focusMuscles);
      const titleStr = dayObj.routineTitle || (focusArray.length > 0 ? `Rutina de ${focusArray.join(' / ')}` : `${dayName} - Entrenamiento`);

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

  const latestDateDisplay = formatLocalDate(today);

  const rawProgram: GymProgram = {
    fileName,
    activeWeekMonday: formatLocalDate(activeWeekStart),
    lastUpdated: latestDateDisplay,
    workoutDays,
    history,
  };

  return sanitizeProgramDatesTo2026(rawProgram);
}
