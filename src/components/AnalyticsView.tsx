import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, AreaChart, Area, ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Dumbbell, Award, Flame, Calendar, Sparkles, 
  Equal, ShieldAlert, BarChart2, ArrowUpRight, ArrowDownRight, Scale,
  Layers, Info, CheckCircle2, AlertTriangle, HelpCircle, Activity,
  Zap, Edit3, Check, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
import { GymProgram } from '../types';
import { 
  getExerciseProgressHistory, getVolumeByMuscleGroup, getPersonalRecords, 
  getWeeklyTonnageSummary, getEffectiveSetsByMuscleGroup, MuscleEffectiveSets,
  ExerciseProgressPoint 
} from '../utils/analytics';
import { getOverloadRecommendation, getMostRecentLogForExercise } from '../utils/progressiveOverload';

interface AnalyticsViewProps {
  program: GymProgram;
}

type ExerciseSortMode = 'day' | 'muscle' | 'alpha';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ program }) => {
  // Get unique exercise names list
  const allExercisesSet = new Set<string>();
  program.workoutDays.forEach(day => {
    day.exercises.forEach(ex => allExercisesSet.add(ex.name));
  });
  program.history.forEach(h => allExercisesSet.add(h.exerciseName));

  const exerciseList = Array.from(allExercisesSet);
  const [selectedExercise, setSelectedExercise] = useState<string>(exerciseList[0] || 'Pull Down Maquina');
  const [exerciseSortMode, setExerciseSortMode] = useState<ExerciseSortMode>('day');
  const [muscleViewMode, setMuscleViewMode] = useState<'completed' | 'planned' | 'tonnage'>('completed');

  // Build organized groups for the dropdown
  const exerciseGroups = useMemo(() => {
    if (exerciseSortMode === 'day') {
      const groups: { label: string; exercises: string[] }[] = [];
      const addedExercises = new Set<string>();

      program.workoutDays.forEach(day => {
        if (day.dayType === 'training' && day.exercises.length > 0) {
          const dayExs: string[] = [];
          day.exercises.forEach(ex => {
            if (!dayExs.includes(ex.name)) {
              dayExs.push(ex.name);
              addedExercises.add(ex.name);
            }
          });
          if (dayExs.length > 0) {
            const muscleStr = day.focusMuscles.length > 0 ? ` · ${day.focusMuscles.join(' / ')}` : '';
            groups.push({
              label: `📅 ${day.dayName.toUpperCase()}${muscleStr}`,
              exercises: dayExs,
            });
          }
        }
      });

      // History-only exercises
      const remaining: string[] = [];
      program.history.forEach(h => {
        if (!addedExercises.has(h.exerciseName) && !remaining.includes(h.exerciseName)) {
          remaining.push(h.exerciseName);
          addedExercises.add(h.exerciseName);
        }
      });

      if (remaining.length > 0) {
        groups.push({
          label: '📜 Historial / Otros Ejercicios',
          exercises: remaining.sort((a, b) => a.localeCompare(b, 'es')),
        });
      }

      return groups;
    }

    if (exerciseSortMode === 'muscle') {
      const muscleMap = new Map<string, Set<string>>();

      const getMuscle = (name: string): string => {
        for (const day of program.workoutDays) {
          const found = day.exercises.find(e => e.name === name);
          if (found && found.muscleGroup) return found.muscleGroup;
        }
        const hist = program.history.find(h => h.exerciseName === name);
        if (hist && hist.muscleGroup) return hist.muscleGroup;
        return 'Otros';
      };

      exerciseList.forEach(name => {
        const muscle = getMuscle(name);
        if (!muscleMap.has(muscle)) {
          muscleMap.set(muscle, new Set());
        }
        muscleMap.get(muscle)!.add(name);
      });

      const orderPriority = ['Pecho', 'Espalda', 'Pierna', 'Cuádriceps', 'Femoral', 'Hombro', 'Bíceps', 'Tríceps', 'Abdomen', 'Core'];
      const sortedMuscles = Array.from(muscleMap.keys()).sort((a, b) => {
        const idxA = orderPriority.findIndex(p => a.toLowerCase().includes(p.toLowerCase()));
        const idxB = orderPriority.findIndex(p => b.toLowerCase().includes(p.toLowerCase()));
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b, 'es');
      });

      return sortedMuscles.map(muscle => ({
        label: `💪 ${muscle.toUpperCase()}`,
        exercises: Array.from(muscleMap.get(muscle)!).sort((a, b) => a.localeCompare(b, 'es')),
      }));
    }

    // Default 'alpha'
    return [
      {
        label: '🔤 Todos los Ejercicios (A - Z)',
        exercises: [...exerciseList].sort((a, b) => a.localeCompare(b, 'es')),
      }
    ];
  }, [exerciseSortMode, program, exerciseList]);

  // User bodyweight state for relative strength calculation
  const [bodyweight, setBodyweight] = useState<number>(() => {
    const saved = localStorage.getItem('gym_user_bodyweight');
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return program.userBodyweight || 75;
  });
  const [isEditingBw, setIsEditingBw] = useState(false);
  const [tempBwInput, setTempBwInput] = useState(String(bodyweight));
  const [smoothCurve, setSmoothCurve] = useState<boolean>(false);

  const handleSaveBodyweight = (newWeight: number) => {
    if (newWeight > 0 && !isNaN(newWeight)) {
      setBodyweight(newWeight);
      localStorage.setItem('gym_user_bodyweight', String(newWeight));
    }
    setIsEditingBw(false);
  };

  // Compute analytics
  const exerciseHistory = getExerciseProgressHistory(program, selectedExercise, bodyweight);
  const effectiveSetsData = getEffectiveSetsByMuscleGroup(program, muscleViewMode === 'tonnage' ? 'completed' : muscleViewMode);
  const volumeByMuscle = getVolumeByMuscleGroup(program);
  const personalRecords = getPersonalRecords(program);
  const weeklySummary = getWeeklyTonnageSummary(program);

  // Latest progress metrics for selected exercise
  const latestPoint = exerciseHistory.length > 0 ? exerciseHistory[exerciseHistory.length - 1] : null;
  const currentMultiplier1RM = latestPoint ? latestPoint.relativeStrength1RM : 0;
  const currentMultiplierWeight = latestPoint ? latestPoint.relativeStrengthMaxWeight : 0;

  // Overall statistics
  const totalVolumeOverall = program.history.reduce((acc, h) => acc + h.volume, 0) +
    program.workoutDays.reduce((acc, day) => 
      acc + day.exercises.reduce((exAcc, ex) => 
        exAcc + ex.currentSets.filter(s => s.completed).reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0)
      , 0)
    , 0);

  const maxPR = personalRecords[0];

  return (
    <div className="space-y-6">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Volumen Acumulado</span>
            <div className="p-2 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">
            {totalVolumeOverall.toLocaleString()} <span className="text-xs text-white/40 font-sans">kg</span>
          </p>
          <p className="text-xs text-white/40 mt-1">Suma de peso × repeticiones totales</p>
        </div>

        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Mayor PR Registrado</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">
            {maxPR ? `${maxPR.maxWeight} kg` : '-'}
          </p>
          <p className="text-xs text-white/40 mt-1 truncate">
            {maxPR ? `${maxPR.exerciseName} (${maxPR.reps} reps)` : 'Sin registros'}
          </p>
        </div>

        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Ejercicios Monitoreados</span>
            <div className="p-2 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Dumbbell className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">
            {exerciseList.length}
          </p>
          <p className="text-xs text-white/40 mt-1">Registrados en la rutina actual</p>
        </div>

        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Días Programados</span>
            <div className="p-2 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2 font-mono">
            {program.workoutDays.filter(d => d.dayType === 'training').length} <span className="text-xs text-white/40 font-sans">días entreno</span>
          </p>
          <p className="text-xs text-white/40 mt-1">
            {program.workoutDays.filter(d => d.dayType === 'rest').length} días de descanso
          </p>
        </div>

      </div>

      {/* Resumen de Carga Semanal (Comparativa vs. Semana Anterior) */}
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Resumen de Carga Semanal</h3>
              {weeklySummary.isWeekIncomplete && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Semana en curso ({weeklySummary.completedDaysCount} de {weeklySummary.totalDaysCount} días)
                </span>
              )}
            </div>
            <p className="text-xs text-white/40 mt-1">
              {weeklySummary.isWeekIncomplete
                ? 'Comparativa basada en las mismas sesiones completadas hasta hoy para evitar falsas caídas por días pendientes.'
                : 'Comparativa del tonelaje total levantado (kg) vs. la semana anterior para monitorear la tendencia de sobrecarga.'
              }
            </p>
          </div>

          {/* Trend Badge Header */}
          <div className="flex items-center space-x-3 shrink-0">
            {weeklySummary.trendStatus === 'INCREASE' && (
              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-xl text-xs font-semibold">
                <ArrowUpRight className="w-4 h-4" />
                <span>+{weeklySummary.percentageChange}% (+{weeklySummary.diffTonnage.toLocaleString()} kg)</span>
                <span className="text-[10px] text-emerald-300/80 font-mono hidden sm:inline">
                  | {weeklySummary.isWeekIncomplete ? 'Sobrecarga en sesiones realizadas' : 'Sobrecarga Creciente'}
                </span>
              </div>
            )}

            {weeklySummary.trendStatus === 'DECREASE' && (
              <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3.5 py-1.5 rounded-xl text-xs font-semibold">
                <ArrowDownRight className="w-4 h-4" />
                <span>{weeklySummary.percentageChange}% ({weeklySummary.diffTonnage.toLocaleString()} kg)</span>
                <span className="text-[10px] text-amber-300/80 font-mono hidden sm:inline">
                  | {weeklySummary.isWeekIncomplete ? 'Menor carga en mismas sesiones' : 'Menor Volumen'}
                </span>
              </div>
            )}

            {weeklySummary.trendStatus === 'EQUAL' && (
              <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3.5 py-1.5 rounded-xl text-xs font-semibold">
                <Scale className="w-4 h-4" />
                <span>Sin variación (0%)</span>
                <span className="text-[10px] text-blue-300/80 font-mono hidden sm:inline">| Carga Mantenida</span>
              </div>
            )}
          </div>
        </div>

        {/* Comparison Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
            <span className="text-[11px] font-medium text-white/50 block">Esta Semana (Acumulado)</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {weeklySummary.currentWeekTonnage.toLocaleString()}
              </span>
              <span className="text-xs text-white/40">kg</span>
            </div>
            <span className="text-[10px] text-emerald-400/80 block mt-1">
              Proyección total: ~{weeklySummary.projectedWeekTonnage.toLocaleString()} kg
            </span>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
            <span className="text-[11px] font-medium text-white/50 block">
              {weeklySummary.isWeekIncomplete && weeklySummary.likeForLikePrevTonnage > 0
                ? 'Mismas Sesiones (Sem. Anterior)'
                : 'Semana Anterior (Total)'}
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold font-mono text-white/90">
                {(weeklySummary.isWeekIncomplete && weeklySummary.likeForLikePrevTonnage > 0
                  ? weeklySummary.likeForLikePrevTonnage
                  : weeklySummary.previousWeekTonnage
                ).toLocaleString()}
              </span>
              <span className="text-xs text-white/40">kg</span>
            </div>
            <span className="text-[10px] text-white/40 block mt-1">
              {weeklySummary.isWeekIncomplete
                ? `Total semana pasada completa: ${weeklySummary.previousWeekTonnage.toLocaleString()} kg`
                : 'Base de comparación semanal previa'}
            </span>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
            <span className="text-[11px] font-medium text-white/50 block">Diferencia de Carga</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className={`text-2xl font-bold font-mono ${
                weeklySummary.diffTonnage > 0 ? 'text-emerald-400' : weeklySummary.diffTonnage < 0 ? 'text-amber-400' : 'text-white'
              }`}>
                {weeklySummary.diffTonnage > 0 ? `+${weeklySummary.diffTonnage.toLocaleString()}` : weeklySummary.diffTonnage.toLocaleString()}
              </span>
              <span className="text-xs text-white/40">kg</span>
            </div>
            <span className="text-[10px] text-white/40 block mt-1">
              {weeklySummary.isWeekIncomplete
                ? 'Comparado en las mismas sesiones completadas'
                : (weeklySummary.diffTonnage >= 0 ? 'Progreso positivo acumulado' : 'Volumen total reducido')}
            </span>
          </div>
        </div>

        {/* Weekly Tonnage Bar Chart */}
        {weeklySummary.weeklyPoints.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySummary.weeklyPoints} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.8} />
                <XAxis dataKey="weekLabel" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis stroke="#737373" fontSize={11} tickLine={false} unit=" kg" />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString()} kg`, 'Peso Total Levantado']}
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', fontSize: '12px', color: '#ffffff' }}
                />
                <Bar dataKey="totalTonnage" name="Tonelaje Total (kg)" radius={[6, 6, 0, 0]}>
                  {weeklySummary.weeklyPoints.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isCurrentWeek ? '#10b981' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-white/30 text-sm italic border border-dashed border-white/10 rounded-xl">
            Aún no hay suficientes datos semanales para construir la gráfica. Completa entrenamientos para ver la tendencia.
          </div>
        )}
      </div>


      {/* Chart 1: Evolution of Max Weight, Estimated 1RM & Relative Strength */}
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
        
        {/* Header: Title, Controls (Exercise Selector + Curve Smoothing Toggle) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Evolución de Fuerza & 1RM Estimado</h3>
              {exerciseHistory.length > 0 && (
                <span className="text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  {exerciseHistory.length} {exerciseHistory.length === 1 ? 'sesión' : 'sesiones en la línea de tiempo'}
                </span>
              )}
            </div>
            <p className="text-xs text-white/40 mt-1">
              Monitoreo de fuerza absoluta, 1RM calculado y fuerza relativa (multiplicador de peso corporal) a través del tiempo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Curve Smoothing Toggle */}
            <button
              type="button"
              onClick={() => setSmoothCurve(prev => !prev)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                smoothCurve
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 shadow-sm'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'
              }`}
              title="Aplica una media móvil para suavizar fluctuaciones diarias y mostrar la tendencia real"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Suavizar Curva</span>
              <span className="sm:hidden">Media Móvil</span>
              {smoothCurve && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse ml-0.5" />
              )}
            </button>

            {/* Sort Mode Segmented Control (Por Día | Por Músculo | A-Z) */}
            <div className="flex items-center bg-[#0a0a0a] p-0.5 rounded-xl border border-white/10 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setExerciseSortMode('day')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  exerciseSortMode === 'day'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-white/50 hover:text-white'
                }`}
                title="Organizar por día de entrenamiento y orden de rutina"
              >
                Por Día
              </button>
              <button
                type="button"
                onClick={() => setExerciseSortMode('muscle')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  exerciseSortMode === 'muscle'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-white/50 hover:text-white'
                }`}
                title="Organizar por grupo muscular"
              >
                Músculo
              </button>
              <button
                type="button"
                onClick={() => setExerciseSortMode('alpha')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  exerciseSortMode === 'alpha'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-white/50 hover:text-white'
                }`}
                title="Organizar alfabéticamente A-Z"
              >
                A-Z
              </button>
            </div>

            {/* Exercise Selector with Optgroups */}
            <div className="w-full sm:w-auto min-w-[200px] max-w-xs">
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/15 text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                {exerciseGroups.map((group) => (
                  <optgroup 
                    key={group.label} 
                    label={group.label} 
                    className="bg-[#141414] text-blue-400 font-bold"
                  >
                    {group.exercises.map((name) => (
                      <option 
                        key={name} 
                        value={name} 
                        className="bg-[#0a0a0a] text-white font-normal py-1"
                      >
                        {name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Badges Strip: Relative Strength (BW Multiplier), Max Load, Bodyweight */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Relative Strength Multiplier Badge */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-white/40 block">Fuerza Relativa (1RM)</span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {currentMultiplier1RM > 0 ? `${currentMultiplier1RM}x` : '-'}
                </span>
                <span className="text-xs text-emerald-400/70 font-sans">BW</span>
              </div>
              <span className="text-[10px] text-white/40 block mt-0.5">
                {latestPoint ? `1RM (${latestPoint.estimated1RM} kg) / ${bodyweight} kg` : 'Sin registros'}
              </span>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          {/* Max Weight Lifted Badge */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-white/40 block">Carga Máxima Actual</span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xl font-bold font-mono text-white">
                  {latestPoint ? (latestPoint.maxWeight === 0 ? 'BW' : `${latestPoint.maxWeight} kg`) : '-'}
                </span>
                {currentMultiplierWeight > 0 && (
                  <span className="text-xs text-white/40 font-mono">({currentMultiplierWeight}x BW)</span>
                )}
              </div>
              <span className="text-[10px] text-white/40 block mt-0.5">
                {latestPoint ? `Mejor serie: ${latestPoint.bestSetContext}` : 'Sin registros'}
              </span>
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>

          {/* Editable Bodyweight Badge */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-white/40 block">Tu Peso Corporal</span>
              {isEditingBw ? (
                <div className="flex items-center space-x-1.5 mt-1">
                  <input
                    type="number"
                    step="0.5"
                    value={tempBwInput}
                    onChange={(e) => setTempBwInput(e.target.value)}
                    className="w-16 bg-white/10 border border-blue-500 text-white font-mono text-sm px-2 py-0.5 rounded-lg focus:outline-none"
                    autoFocus
                  />
                  <span className="text-xs text-white/40">kg</span>
                  <button
                    type="button"
                    onClick={() => handleSaveBodyweight(parseFloat(tempBwInput))}
                    className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors"
                    title="Guardar peso"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className="text-xl font-bold font-mono text-white">{bodyweight}</span>
                  <span className="text-xs text-white/40">kg</span>
                </div>
              )}
              <span className="text-[10px] text-white/40 block mt-0.5">
                Base para cálculo de fuerza relativa
              </span>
            </div>

            {!isEditingBw && (
              <button
                type="button"
                onClick={() => {
                  setTempBwInput(String(bodyweight));
                  setIsEditingBw(true);
                }}
                className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl border border-white/10 transition-colors"
                title="Editar peso corporal"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Recharts Multi-Axis Visualization */}
        {exerciseHistory.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={exerciseHistory} margin={{ top: 15, right: 25, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.8} />
                <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
                
                {/* Left Y-Axis: Absolute Weight & 1RM in kg */}
                <YAxis 
                  yAxisId="left" 
                  stroke="#737373" 
                  fontSize={11} 
                  tickLine={false} 
                  unit=" kg" 
                  domain={[
                    (dataMin: number) => Math.max(0, Math.floor(dataMin * 0.8)),
                    (dataMax: number) => Math.ceil(dataMax * 1.15)
                  ]}
                />

                {/* Right Y-Axis: Relative Strength Multiplier (x BW) */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#9ca3af" 
                  fontSize={11} 
                  tickLine={false} 
                  unit="x" 
                  domain={[
                    0,
                    (dataMax: number) => Math.max(2, Math.ceil(dataMax * 1.25))
                  ]}
                />

                {/* Enriched Tooltip with Exact Reps Context & Multipliers */}
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload as ExerciseProgressPoint;
                    return (
                      <div className="bg-[#0a0a0a] border border-white/20 rounded-xl p-3.5 shadow-2xl text-xs space-y-2 max-w-xs">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                          <span className="font-semibold text-white">{data.fullDate || data.date}</span>
                          {smoothCurve && (
                            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                              Media Móvil
                            </span>
                          )}
                        </div>
                        
                        {/* Exact Set Rep Range Context */}
                        <div className="bg-white/5 p-2 rounded-lg border border-white/5 space-y-0.5">
                          <div className="text-[10px] text-white/50 uppercase font-semibold">Mejor Serie de la Sesión:</div>
                          <div className="text-sm font-bold font-mono text-emerald-400">
                            {data.bestSetContext}
                          </div>
                        </div>

                        <div className="space-y-1 text-white/80 font-mono text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-white/50 font-sans">Peso Máximo:</span>
                            <span className="text-white font-bold">{smoothCurve ? data.smoothMaxWeight : data.maxWeight} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/50 font-sans">1RM Estimado:</span>
                            <span className="text-blue-400 font-bold">{smoothCurve ? data.smooth1RM : data.estimated1RM} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/50 font-sans">Fuerza Relativa (1RM):</span>
                            <span className="text-emerald-400 font-bold">
                              {smoothCurve ? data.smoothRelativeStrength : data.relativeStrength1RM}x BW ({bodyweight} kg)
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-white/10">
                            <span className="text-white/50 font-sans">Volumen Sesión:</span>
                            <span className="text-white">{data.totalVolume.toLocaleString()} kg ({data.sets.length} series)</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />

                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                {/* Solid Area/Line for Max Weight */}
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey={smoothCurve ? "smoothMaxWeight" : "maxWeight"} 
                  name={smoothCurve ? "Peso Máx (Media Móvil kg)" : "Peso Máximo (kg)"} 
                  stroke="#2563eb" 
                  fillOpacity={1} 
                  fill="url(#weightGrad)" 
                  strokeWidth={2.5} 
                  dot={{ r: exerciseHistory.length === 1 ? 6 : 3, fill: '#2563eb', stroke: '#1d4ed8', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />

                {/* Line for Estimated 1RM */}
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey={smoothCurve ? "smooth1RM" : "estimated1RM"} 
                  name={smoothCurve ? "1RM (Media Móvil kg)" : "1RM Estimado (kg)"} 
                  stroke="#60a5fa" 
                  strokeWidth={2.5} 
                  strokeDasharray="4 4"
                  dot={{ r: exerciseHistory.length === 1 ? 6 : 3, fill: '#60a5fa', stroke: '#3b82f6', strokeWidth: 2 }} 
                  activeDot={{ r: 7 }}
                />

                {/* Neutral Line for Relative Strength (x BW Multiplier) on Right Axis */}
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey={smoothCurve ? "smoothRelativeStrength" : "relativeStrength1RM"} 
                  name="Fuerza Relativa (x BW)" 
                  stroke="#9ca3af" 
                  strokeWidth={2} 
                  strokeDasharray="3 3"
                  dot={{ r: exerciseHistory.length === 1 ? 6 : 3, fill: '#ffffff', stroke: '#9ca3af', strokeWidth: 2 }} 
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-white/30 text-sm italic border border-dashed border-white/10 rounded-xl">
            Aún no hay suficientes registros históricos para este ejercicio. Realiza sesiones y marca tus series completadas.
          </div>
        )}

        {exerciseHistory.length === 1 && (
          <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
            <span className="text-base">💡</span>
            <span>
              <strong>Punto de partida inicial registrado:</strong> Este ejercicio cuenta actualmente con 1 sesión registrada ({exerciseHistory[0].date}). A medida que completes más semanas de entrenamiento, el gráfico trazará automáticamente las líneas de progresión y tendencias de sobrecarga progresiva.
            </span>
          </div>
        )}
      </div>

      {/* Chart 2: Effective Sets by Muscle Group (Hipertrofia Real) */}
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Series Efectivas por Grupo Muscular</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Ciencia de Hipertrofia
              </span>
            </div>
            <p className="text-xs text-white/50 mt-1">
              El volumen real de hipertrofia se mide en <strong>Series Efectivas (cercanas al fallo)</strong> por músculo a la semana.
            </p>
          </div>

          {/* View Mode Selector Tabs */}
          <div className="flex items-center bg-[#0a0a0a] p-1 rounded-xl border border-white/10 text-xs shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setMuscleViewMode('completed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                muscleViewMode === 'completed'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Esta Semana (Hechas)
            </button>
            <button
              type="button"
              onClick={() => setMuscleViewMode('planned')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                muscleViewMode === 'planned'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Planificadas (Rutina)
            </button>
            <button
              type="button"
              onClick={() => setMuscleViewMode('tonnage')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                muscleViewMode === 'tonnage'
                  ? 'bg-white/20 text-white shadow-md'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              Kilos (kg)
            </button>
          </div>
        </div>

        {/* Hypertrophy Scientific Range Legend / Landmarks */}
        {muscleViewMode !== 'tonnage' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 flex items-start space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
              <div>
                <span className="font-semibold text-emerald-300 block">10 a 20 series · Rango Óptimo (MAV)</span>
                <span className="text-[11px] text-white/60 leading-snug block mt-0.5">
                  Máximo estímulo hipertrófico y adaptación muscular con buena capacidad de recuperación.
                </span>
              </div>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 flex items-start space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 shrink-0" />
              <div>
                <span className="font-semibold text-amber-300 block">&lt; 10 series · Volumen Bajo (MEV)</span>
                <span className="text-[11px] text-white/60 leading-snug block mt-0.5">
                  Mantenimiento o estímulo mínimo. Incrementa series semanales para acelerar ganancias.
                </span>
              </div>
            </div>

            <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3 flex items-start space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400 mt-1 shrink-0" />
              <div>
                <span className="font-semibold text-rose-300 block">&gt; 20 series · Volumen Basura (MRV)</span>
                <span className="text-[11px] text-white/60 leading-snug block mt-0.5">
                  Fatiga acumulada excesiva sin beneficio de crecimiento adicional. Considera reducir series.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Chart Rendering */}
        {muscleViewMode === 'tonnage' ? (
          volumeByMuscle.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeByMuscle} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.8} />
                  <XAxis dataKey="muscle" stroke="#737373" fontSize={11} tickLine={false} />
                  <YAxis stroke="#737373" fontSize={11} tickLine={false} unit=" kg" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', fontSize: '12px', color: '#ffffff' }}
                  />
                  <Bar dataKey="totalVolume" name="Volumen Total (kg)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-white/30 text-sm italic border border-dashed border-white/10 rounded-xl">
              Registra tu primera sesión para ver la distribución en kilogramos.
            </div>
          )
        ) : effectiveSetsData.length > 0 ? (
          <div className="space-y-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={effectiveSetsData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.8} />
                  <XAxis dataKey="muscle" stroke="#737373" fontSize={11} tickLine={false} />
                  <YAxis stroke="#737373" fontSize={11} tickLine={false} unit=" ser" domain={[0, 'dataMax + 4']} />
                  <ReferenceLine y={10} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Mínimo Óptimo (10 ser)', position: 'insideTopLeft', fill: '#10b981', fontSize: 10 }} />
                  <ReferenceLine y={20} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Límite Volumen Basura (20 ser)', position: 'insideTopLeft', fill: '#f43f5e', fontSize: 10 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const item = payload[0].payload as MuscleEffectiveSets;
                      return (
                        <div className="bg-[#0a0a0a] border border-white/20 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 max-w-xs">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-bold text-white text-sm">{item.muscle}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.badgeTextColor} ${item.badgeBg} border ${item.badgeBorder}`}>
                              {item.statusLabel}
                            </span>
                          </div>
                          <p className="text-white/80 font-mono">
                            <strong className="text-white">{item.effectiveSets} series</strong> {muscleViewMode === 'planned' ? 'planificadas/sem' : 'completadas esta semana'}
                          </p>
                          {muscleViewMode === 'completed' && (
                            <p className="text-[11px] text-white/50 font-mono">
                              (Planificado total: {item.plannedWeeklySets} series)
                            </p>
                          )}
                          {item.exerciseNames && item.exerciseNames.length > 0 && (
                            <div className="pt-1 border-t border-white/10 text-[10px] text-white/50">
                              <span className="text-white/70 block font-medium mb-0.5">Ejercicios incluidos:</span>
                              {item.exerciseNames.join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="effectiveSets" name="Series Efectivas" radius={[6, 6, 0, 0]}>
                    {effectiveSetsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Muscle Breakdown Bento Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {effectiveSetsData.map((item) => {
                const percentOptimal = Math.min(Math.round((item.effectiveSets / 20) * 100), 125);
                return (
                  <div key={item.muscle} className="bg-[#0a0a0a] border border-white/10 rounded-xl p-3.5 space-y-2 hover:border-white/20 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-xs">{item.muscle}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.badgeTextColor} ${item.badgeBg} border ${item.badgeBorder}`}>
                        {item.effectiveSets} series/sem
                      </span>
                    </div>

                    {/* Progress visual bar against 10-20 benchmark */}
                    <div className="space-y-1">
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden flex">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(percentOptimal, 100)}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-white/40 font-mono">
                        <span>0 ser</span>
                        <span className="text-emerald-400/80">10-20 ser (Óptimo)</span>
                        <span className="text-rose-400/80">&gt;20 ser</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-white/40 truncate">
                      {item.exerciseNames.join(' · ')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-white/30 text-sm italic border border-dashed border-white/10 rounded-xl">
            No hay ejercicios asignados a grupos musculares en tu rutina actual.
          </div>
        )}
      </div>

      {/* Section 3: Progressive Overload AI Trainer Recommendations Summary */}
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Recomendaciones de Sobrecarga Progresiva</h3>
          </div>
          <p className="text-xs text-white/40 mt-0.5">Análisis inteligente basado en tu desempeño de la semana pasada para tu siguiente sesión.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/10 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Ejercicio</th>
                <th className="py-2.5 px-3">Semana Pasada</th>
                <th className="py-2.5 px-3">Objetivo</th>
                <th className="py-2.5 px-3">Diagnóstico Entrenador</th>
                <th className="py-2.5 px-3">Carga Sugerida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {program.workoutDays.flatMap(d => d.exercises).map((ex) => {
                const prev = getMostRecentLogForExercise(ex, program);
                if (!prev) {
                  return (
                    <tr key={ex.id} className="hover:bg-white/5">
                      <td className="py-3 px-3 font-medium text-white">
                        {ex.name}
                        <span className="text-[10px] text-white/40 block">{ex.muscleGroup}</span>
                      </td>
                      <td className="py-3 px-3 text-white/40 font-mono">Sin log</td>
                      <td className="py-3 px-3 text-white/70">{ex.targetReps} reps</td>
                      <td className="py-3 px-3 text-white/40">Pendiente de registro</td>
                      <td className="py-3 px-3 text-white/40 font-mono">-</td>
                    </tr>
                  );
                }

                const advice = getOverloadRecommendation(prev.weight, prev.reps, ex.targetReps, {
                  exercise: ex,
                  program,
                  recentSets: prev.sets,
                });

                return (
                  <tr key={ex.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-medium text-white">
                      {ex.name}
                      <span className="text-[10px] text-white/40 block">{ex.muscleGroup}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-white">
                      {prev.weight === 0 ? 'BW' : `${prev.weight} kg`} × {prev.reps} reps
                      {prev.isFromCurrentWeek && (
                        <span className="text-[10px] text-blue-400 block font-sans">Esta semana</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-white/70">
                      {ex.targetReps} reps
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${advice.badgeTextColor} ${advice.badgeBg} border ${advice.badgeBorder}`}>
                        {advice.badgeText}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {advice.suggestedWeight === 0 ? 'BW (Peso Corp.)' : `${advice.suggestedWeight} kg`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
