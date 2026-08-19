import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GoogleDriveBar } from './components/GoogleDriveBar';
import { WeeklyRoutineOverview } from './components/WeeklyRoutineOverview';
import { WorkoutLogger } from './components/WorkoutLogger';
import { AnalyticsView } from './components/AnalyticsView';
import { PersonalRecords } from './components/PersonalRecords';
import { ExcelUploaderModal } from './components/ExcelUploaderModal';
import { RestTimerModal } from './components/RestTimerModal';
import { AddExerciseModal } from './components/AddExerciseModal';
import { NewWeekModal } from './components/NewWeekModal';

import { INITIAL_SAMPLE_PROGRAM } from './utils/sampleData';
import { exportProgramToExcel } from './utils/excelExporter';
import { sanitizeProgramDatesTo2026 } from './utils/excelParser';
import { syncProgramHistory, checkAndPerformWeeklyRollover, performRollover } from './utils/historySync';
import { checkDriveStatus, syncToDrive } from './utils/googleDriveSync';
import { GymProgram, WorkoutDay, Exercise } from './types';

const STORAGE_KEY = 'gym_progress_program_v2';

function getFirstUncompletedDayId(p: GymProgram): string {
  const uncompleted = p.workoutDays.find(d => {
    if (d.dayType === 'rest') return false;
    if (d.exercises.length === 0) return false;
    return d.exercises.some(ex => ex.currentSets.some(s => !s.completed));
  });
  return uncompleted ? uncompleted.id : p.workoutDays[0]?.id || 'day-1';
}

export default function App() {
  const [program, setProgram] = useState<GymProgram>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const sanitized = sanitizeProgramDatesTo2026(parsed);
        if (!sanitized.history) {
          sanitized.history = [];
        }
        return sanitized;
      }
    } catch (e) {
      console.error('Failed to load local program:', e);
    }
    return sanitizeProgramDatesTo2026(INITIAL_SAMPLE_PROGRAM);
  });

  const [activeTab, setActiveTab] = useState<'workout' | 'analytics' | 'prs'>('workout');
  const [activeDayId, setActiveDayId] = useState<string>(() => {
    return getFirstUncompletedDayId(program);
  });

  // Modals state
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [isNewWeekModalOpen, setIsNewWeekModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-migrate dates to 2026 and save changes to localStorage
  useEffect(() => {
    try {
      const sanitized = sanitizeProgramDatesTo2026(program);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch (e) {
      console.error('Failed to save program locally:', e);
    }
  }, [program]);

  // Clean any old 2025 dates on initial mount
  useEffect(() => {
    setProgram(prev => sanitizeProgramDatesTo2026(prev));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check for automatic weekly rollover on startup
  useEffect(() => {
    const { program: updatedProgram, rolledOver } = checkAndPerformWeeklyRollover(program);
    if (rolledOver) {
      setProgram(updatedProgram);
      showToast('📅 ¡Nueva semana iniciada! Tu progreso previo se guardó en el historial.');
    }
  }, []);

  const handleStartNewWeek = () => {
    setIsNewWeekModalOpen(true);
  };

  const handleConfirmNewWeek = async () => {
    const rolledOverProgram = performRollover(program);
    setProgram(rolledOverProgram);
    if (rolledOverProgram.workoutDays.length > 0) {
      setActiveDayId(rolledOverProgram.workoutDays[0].id);
    }
    showToast('🚀 ¡Nuevo ciclo semanal iniciado! Cargas y repeticiones archivadas en el historial.');

    // Auto-sync new week program to Google Drive if connected
    try {
      const st = await checkDriveStatus();
      if (st.authenticated) {
        await syncToDrive(rolledOverProgram);
      }
    } catch (e) {
      console.error('Error auto-syncing new week to Drive:', e);
    }
  };

  const handleProgramLoaded = async (newProgram: GymProgram) => {
    const cleanProgram = sanitizeProgramDatesTo2026(newProgram);
    setProgram(cleanProgram);
    if (cleanProgram.workoutDays.length > 0) {
      setActiveDayId(getFirstUncompletedDayId(cleanProgram));
    }
    showToast(`✅ ¡Archivo "${cleanProgram.fileName}" cargado correctamente!`);

    // Auto-sync newly loaded Excel to Google Drive if connected
    try {
      const st = await checkDriveStatus();
      if (st.authenticated) {
        showToast(`☁️ Guardando "${cleanProgram.fileName}" en Google Drive...`);
        const syncRes = await syncToDrive(cleanProgram);
        if (syncRes.success) {
          showToast(`☁️ ¡"${cleanProgram.fileName}" respaldado exitosamente en Google Drive!`);
        }
      } else {
        showToast(`💡 Tip: Puedes conectar Google Drive para respaldar este Excel en la nube.`);
      }
    } catch (e) {
      console.error('Error auto-syncing Excel to Drive:', e);
    }
  };

  const handleLoadSample = () => {
    const clean = sanitizeProgramDatesTo2026(INITIAL_SAMPLE_PROGRAM);
    setProgram(clean);
    setActiveDayId(clean.workoutDays[0].id);
    showToast('✨ Rutina demo de ejemplo cargada.');
  };

  const handleResetProgress = () => {
    if (window.confirm('¿Deseas reiniciar la rutina a sus valores iniciales de ejemplo?')) {
      handleLoadSample();
    }
  };

  const handleExportExcel = () => {
    try {
      exportProgramToExcel(program);
      showToast('📥 Descargando archivo Excel actualizado...');
    } catch (e) {
      console.error(e);
      alert('Error al generar el archivo de Excel.');
    }
  };

  // Active workout day updates
  const activeDay = program.workoutDays.find(d => d.id === activeDayId) || program.workoutDays[0];

  const handleUpdateDay = (updatedDay: WorkoutDay) => {
    const updatedDays = program.workoutDays.map(d => d.id === updatedDay.id ? updatedDay : d);
    const updatedProgram = syncProgramHistory({
      ...program,
      workoutDays: updatedDays,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    setProgram(updatedProgram);
  };

  const handleAddExerciseToActiveDay = (newEx: Exercise) => {
    if (!activeDay) return;
    const updatedDay: WorkoutDay = {
      ...activeDay,
      exercises: [...activeDay.exercises, newEx],
    };
    handleUpdateDay(updatedDay);
    showToast(`💪 Ejercicio "${newEx.name}" agregado a ${activeDay.dayName}.`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0f0f0f] border border-blue-500/40 text-blue-300 px-4 py-3 rounded-xl shadow-2xl text-xs font-medium flex items-center space-x-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        program={program}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUploadClick={() => setIsUploaderOpen(true)}
        onLoadSampleClick={handleLoadSample}
        onExportClick={handleExportExcel}
        onResetProgress={handleResetProgress}
      />

      {/* Google Drive Auto-Sync Bar */}
      <GoogleDriveBar
        program={program}
        onProgramLoadedFromDrive={(loadedProgram) => {
          setProgram(loadedProgram);
          if (loadedProgram.workoutDays.length > 0) {
            setActiveDayId(getFirstUncompletedDayId(loadedProgram));
          }
        }}
        showToast={showToast}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'workout' && (
          <div>
            {/* 7-Day Routine Split */}
            <WeeklyRoutineOverview
              workoutDays={program.workoutDays}
              activeDayId={activeDayId}
              activeWeekMonday={program.activeWeekMonday}
              onSelectDay={setActiveDayId}
              onStartNewWeek={handleStartNewWeek}
            />

            {/* Selected Workout Logger */}
            {activeDay && (
              <WorkoutLogger
                day={activeDay}
                program={program}
                onUpdateDay={handleUpdateDay}
                onOpenRestTimer={() => setIsRestTimerOpen(true)}
                onAddExerciseClick={() => setIsAddExerciseOpen(true)}
              />
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView program={program} />
        )}

        {activeTab === 'prs' && (
          <PersonalRecords program={program} />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#0f0f0f] border-t border-white/10 py-6 mt-12 text-center text-xs text-white/40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>IronLogic Pro · Registro de Avance en Gimnasio © 2026</p>
          <p className="text-white/50">Progreso personal, detección de rutinas e inteligencia de Excel</p>
        </div>
      </footer>

      {/* Modals */}
      <ExcelUploaderModal
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onProgramLoaded={handleProgramLoaded}
        onLoadSample={handleLoadSample}
      />

      <RestTimerModal
        isOpen={isRestTimerOpen}
        onClose={() => setIsRestTimerOpen(false)}
        onOpen={() => setIsRestTimerOpen(true)}
      />

      <AddExerciseModal
        isOpen={isAddExerciseOpen}
        onClose={() => setIsAddExerciseOpen(false)}
        onAddExercise={handleAddExerciseToActiveDay}
      />

      <NewWeekModal
        isOpen={isNewWeekModalOpen}
        onClose={() => setIsNewWeekModalOpen(false)}
        onConfirm={handleConfirmNewWeek}
        program={program}
      />

    </div>
  );
}
