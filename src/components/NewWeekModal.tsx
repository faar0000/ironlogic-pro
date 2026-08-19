import React from 'react';
import { RotateCcw, X, CheckCircle, ArrowRight, ShieldCheck, Sparkles, Calendar } from 'lucide-react';
import { GymProgram } from '../types';
import { getProgramActiveMonday } from '../utils/historySync';
import { formatLocalDate } from '../utils/excelParser';

interface NewWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  program: GymProgram;
}

export const NewWeekModal: React.FC<NewWeekModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  program,
}) => {
  if (!isOpen) return null;

  const currentMonday = getProgramActiveMonday(program);
  const currentMondayStr = formatLocalDate(currentMonday);

  const nextMonday = new Date(
    currentMonday.getFullYear(),
    currentMonday.getMonth(),
    currentMonday.getDate() + 7,
    12,
    0,
    0
  );
  const nextMondayStr = formatLocalDate(nextMonday);

  // Calculate statistics of current completed sets
  let completedSetsCount = 0;
  let totalSetsCount = 0;
  program.workoutDays.forEach(day => {
    day.exercises.forEach(ex => {
      totalSetsCount += ex.currentSets.length;
      completedSetsCount += ex.currentSets.filter(s => s.completed && (s.weight > 0 || s.reps > 0)).length;
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#121212] border border-white/15 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#171717]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">Iniciar Nuevo Ciclo Semanal</h3>
              <p className="text-xs text-white/50">Cierre de semana y preparación de cargas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Week transition badge */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0a0a0a] border border-white/10">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-xs text-white/50 block">Semana actual</span>
                <span className="text-sm font-semibold text-white">Sem. {currentMondayStr}</span>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-blue-400" />

            <div className="text-right">
              <span className="text-xs text-emerald-400 font-medium block">Nueva semana</span>
              <span className="text-sm font-bold text-emerald-300">Sem. {nextMondayStr}</span>
            </div>
          </div>

          {/* Explanation points */}
          <div className="space-y-2.5">
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white block">Respaldo Automático en Historial</span>
                <span className="text-white/60">
                  Las <strong className="text-blue-300">{completedSetsCount} series completadas</strong> de esta semana se guardarán permanentemente en tu base de datos y gráficos de progreso.
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white block">Actualización de Registros Previos</span>
                <span className="text-white/60">
                  Tus mejores marcas logradas esta semana pasarán a ser la referencia ("Semana pasada") para guiar tu sobrecarga progresiva.
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white block">Reinicio Limpio de Casillas</span>
                <span className="text-white/60">
                  Las casillas de verificación se desmarcarán para el nuevo ciclo, manteniendo tus pesos base precargados para que no tengas que escribirlos de nuevo.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-white/10 bg-[#171717]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Confirmar e Iniciar Nueva Semana
          </button>
        </div>
      </div>
    </div>
  );
};
