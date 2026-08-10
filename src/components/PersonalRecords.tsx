import React, { useState } from 'react';
import { Award, Trophy, Search, Flame, Sparkles } from 'lucide-react';
import { GymProgram } from '../types';
import { getPersonalRecords } from '../utils/analytics';

interface PersonalRecordsProps {
  program: GymProgram;
}

export const PersonalRecords: React.FC<PersonalRecordsProps> = ({ program }) => {
  const prs = getPersonalRecords(program);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPRs = prs.filter(pr => 
    pr.exerciseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pr.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header & Search */}
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Galería de Récords Personales (PR)</h2>
              <p className="text-xs text-white/40">Tus mejores marcas en pesos y repeticiones registradas.</p>
            </div>
          </div>

          {/* Search box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
            <input
              type="text"
              placeholder="Buscar ejercicio o músculo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid of PR Badges */}
      {filteredPRs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPRs.map((pr, index) => (
            <div
              key={pr.exerciseName}
              className="bg-[#0f0f0f] border border-white/10 hover:border-white/20 rounded-2xl p-5 shadow-xl relative overflow-hidden group transition-all"
            >
              {/* Top rank ribbon for top 3 */}
              {index < 3 && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-medium px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>PR #{index + 1}</span>
                </div>
              )}

              <div className="flex items-start justify-between mb-2">
                <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/10 font-medium">
                  {pr.muscleGroup}
                </span>
              </div>

              <h3 className="text-base font-semibold text-white mb-3 line-clamp-1">{pr.exerciseName}</h3>

              <div className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 flex items-center justify-between mb-3">
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block">Peso Máximo</span>
                  <span className="text-2xl font-bold text-blue-400 font-mono flex items-baseline space-x-1">
                    {pr.maxWeight === 0 ? (
                      <>
                        <span>BW</span>
                        <span className="text-xs text-white/50 font-sans font-normal ml-1">(Peso Corp.)</span>
                      </>
                    ) : (
                      `${pr.maxWeight} kg`
                    )}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block">Repeticiones</span>
                  <span className="text-lg font-medium text-white/90">{pr.reps} reps</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/10">
                <span>
                  1RM Estimado:{' '}
                  <strong className="text-blue-400 font-mono">
                    {pr.estimated1RM === 0 ? 'BW (Peso Corp.)' : `${pr.estimated1RM} kg`}
                  </strong>
                </span>
                <span className="text-[11px] text-white/30 font-mono">{pr.date}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#0f0f0f] border border-white/10 rounded-2xl">
          <p className="text-white/40 text-sm">No se encontraron récords personales para tu búsqueda.</p>
        </div>
      )}

    </div>
  );
};
