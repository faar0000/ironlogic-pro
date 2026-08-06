import React, { useState } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, AreaChart, Area 
} from 'recharts';
import { TrendingUp, Dumbbell, Award, Flame, Calendar, Sparkles, Equal, ShieldAlert } from 'lucide-react';
import { GymProgram } from '../types';
import { getExerciseProgressHistory, getVolumeByMuscleGroup, getPersonalRecords } from '../utils/analytics';
import { getOverloadRecommendation } from '../utils/progressiveOverload';

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
                const prev = ex.previousLogs;
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

                const advice = getOverloadRecommendation(prev.weight, prev.reps, ex.targetReps);

                return (
                  <tr key={ex.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-medium text-white">
                      {ex.name}
                      <span className="text-[10px] text-white/40 block">{ex.muscleGroup}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-white">
                      {prev.weight} kg × {prev.reps} reps
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
                      {advice.suggestedWeight} kg
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
