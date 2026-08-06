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
    <>
      <header className="bg-[#0f0f0f] border-b border-white/10 sticky top-0 z-30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5 md:py-3.5 gap-2 md:gap-4">
            
            {/* Logo & Info */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30 flex-shrink-0">
                <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <h1 className="text-base sm:text-xl font-medium tracking-tight text-white whitespace-nowrap">
                    IronLogic <span className="text-blue-500 font-light italic">Pro</span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-600/10 text-blue-400 border border-blue-500/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Excel Sync
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-white/40 font-mono truncate max-w-[130px] xs:max-w-xs sm:max-w-md">
                  {program.fileName ? `SYNCED: ${program.fileName}` : 'Registro e Inteligencia de Gimnasio'}
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center bg-[#0a0a0a] p-1 rounded-xl border border-white/10 text-xs font-medium">
              <button
                id="tab-workout"
                onClick={() => setActiveTab('workout')}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'workout'
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Rutina & Registro</span>
                <span className="sm:hidden">Rutina</span>
              </button>

              <button
                id="tab-analytics"
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Evolución</span>
                <span className="sm:hidden">Gráficos</span>
              </button>

              <button
                id="tab-prs"
                onClick={() => setActiveTab('prs')}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'prs'
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>PRs</span>
              </button>
            </div>

            {/* Desktop Action Buttons (Sticky Header) */}
            <div className="hidden md:flex items-center flex-wrap gap-2">
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

      {/* Mobile Action Buttons (Scrollable - non sticky, situated in initial top part of page) */}
      <div className="md:hidden bg-[#0d0d0d] border-b border-white/5 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-start gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            id="btn-upload-excel-mobile"
            onClick={onUploadClick}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            Subir Excel
          </button>

          <button
            id="btn-sample-excel-mobile"
            onClick={onLoadSampleClick}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-950/30 hover:bg-blue-900/40 text-blue-300 border border-blue-500/30 transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            Rutina Demo
          </button>

          <button
            id="btn-export-excel-mobile"
            onClick={onExportClick}
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Descargar Excel
          </button>

          <button
            id="btn-reset-data-mobile"
            onClick={onResetProgress}
            className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
            title="Reiniciar datos locales"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
};
