import React, { useState } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Dumbbell, Award, Flame, Calendar, Sparkles, 
  Equal, ShieldAlert, BarChart2, ArrowUpRight, ArrowDownRight, Scale 
} from 'lucide-react';
import { GymProgram } from '../types';
import { 
  getExerciseProgressHistory, getVolumeByMuscleGroup, getPersonalRecords, 
  getWeeklyTonnageSummary 
} from '../utils/analytics';
import { getOverloadRecommendation, getMostRecentLogForExercise } from '../utils/progressiveOverload';

interface AnalyticsViewProps {
  program: GymProgram;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ program }) => {
  // Get unique exercise names list
  const allExercisesSet = new Set<string>();
  program.workoutDays.forEach(day => {
    day.exercises.forEach(ex => allExercisesSet.add(ex.name));
  });
  program.history.forEach(h => allExercisesSet.add(h.exerciseName));

  const exerciseList = Array.from(allExercisesSet);
  const [selectedExercise, setSelectedExercise] = useState<string>(exerciseList[0] || 'Press de Banca Plano con Barra');

  // Compute analytics
  const exerciseHistory = getExerciseProgressHistory(program, selectedExercise);
  const volumeByMuscle = getVolumeByMuscleGroup(program);
  const personalRecords = getPersonalRecords(program);
  const weeklySummary = getWeeklyTonnageSummary(program);

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


      {/* Chart 1: Evolution of Max Weight & 1RM for Selected Exercise */}
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Evolución de Fuerza & 1RM Estimado</h3>
            </div>
            <p className="text-xs text-white/40 mt-0.5">Seguimiento de peso máximo y fuerza calculada a través del tiempo.</p>
          </div>

          {/* Exercise Selector */}
          <div className="shrink-0">
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-[#0a0a0a] border border-white/10 text-white text-xs font-medium rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none max-w-xs"
            >
              {exerciseList.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {exerciseHistory.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={exerciseHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.8} />
                <XAxis dataKey="date" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis stroke="#737373" fontSize={11} tickLine={false} unit=" kg" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', fontSize: '12px', color: '#ffffff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="maxWeight" name="Peso Máximo (kg)" stroke="#2563eb" fillOpacity={1} fill="url(#weightGrad)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="estimated1RM" name="1RM Estimado (kg)" stroke="#60a5fa" fillOpacity={1} fill="url(#rmGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-white/30 text-sm italic border border-dashed border-white/10 rounded-xl">
            Aún no hay suficientes registros históricos para este ejercicio. Realiza sesiones y marca tus series completadas.
          </div>
        )}
      </div>

      {/* Chart 2: Total Volume Distribution by Muscle Group */}
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white">Volumen de Trabajo por Grupo Muscular</h3>
          <p className="text-xs text-white/40 mt-0.5">Distribución total de peso levantado por zona del cuerpo (kg).</p>
        </div>

        {volumeByMuscle.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeByMuscle} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.8} />
                <XAxis dataKey="muscle" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis stroke="#737373" fontSize={11} tickLine={false} unit=" kg" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', fontSize: '12px', color: '#ffffff' }}
                />
                <Bar dataKey="totalVolume" name="Volumen Total (kg)" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-white/30 text-sm italic border border-dashed border-white/10 rounded-xl">
            Registra tu primera sesión para ver la distribución muscular.
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
