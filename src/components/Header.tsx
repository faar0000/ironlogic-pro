import React from 'react';
import { Dumbbell, Upload, Download, Sparkles, RefreshCw, BarChart3, CalendarCheck } from 'lucide-react';
import { GymProgram } from '../types';

interface HeaderProps {
  program: GymProgram;
  activeTab: 'workout' | 'analytics' | 'prs';
  setActiveTab: (tab: 'workout' | 'analytics' | 'prs') => void;
  onUploadClick: () => void;
  onLoadSampleClick: () => void;
  onExportClick: () => void;
  onResetProgress: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  program,
  activeTab,
  setActiveTab,
  onUploadClick,
  onLoadSampleClick,
  onExportClick,
  onResetProgress,
}) => {
  return (
    <header className="bg-[#0f0f0f] border-b border-white/10 sticky top-0 z-30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-4">
          
          {/* Logo & Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-medium tracking-tight text-white">
                  IronLogic <span className="text-blue-500 font-light italic">Pro</span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-600/10 text-blue-400 border border-blue-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Excel Sync
                </span>
              </div>
              <p className="text-xs text-white/40 font-mono truncate max-w-xs sm:max-w-md">
                {program.fileName ? `SYNCED: ${program.fileName}` : 'Registro e Inteligencia de Gimnasio'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-[#0a0a0a] p-1 rounded-xl border border-white/10 text-xs font-medium self-start md:self-auto">
            <button
              id="tab-workout"
              onClick={() => setActiveTab('workout')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'workout'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Rutina & Registro</span>
            </button>

            <button
              id="tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Evolución & Gráficos</span>
            </button>

            <button
              id="tab-prs"
              onClick={() => setActiveTab('prs')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'prs'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Récords (PR)</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              id="btn-upload-excel"
              onClick={onUploadClick}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
              title="Cargar archivo de Excel (.xlsx)"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Subir Excel
            </button>

            <button
              id="btn-sample-excel"
              onClick={onLoadSampleClick}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-950/30 hover:bg-blue-900/40 text-blue-300 border border-blue-500/30 transition-colors"
              title="Cargar plantilla de ejemplo"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Rutina Demo
            </button>

            <button
              id="btn-export-excel"
              onClick={onExportClick}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors shadow-sm"
              title="Descargar Excel con datos actualizados"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Descargar Excel
            </button>

            <button
              id="btn-reset-data"
              onClick={onResetProgress}
              className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
              title="Reiniciar datos locales"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
