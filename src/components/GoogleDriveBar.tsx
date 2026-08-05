import React, { useState, useEffect } from 'react';
import { Cloud, CloudCheck, CloudUpload, CloudDownload, LogOut, Loader2, CheckCircle2 } from 'lucide-react';
import { GymProgram } from '../types';
import { checkDriveStatus, loginWithDrive, logoutDrive, syncToDrive, loadFromDrive, DriveAuthStatus } from '../utils/googleDriveSync';

interface GoogleDriveBarProps {
  program: GymProgram;
  onProgramLoadedFromDrive: (loadedProgram: GymProgram) => void;
  showToast: (msg: string) => void;
}

export const GoogleDriveBar: React.FC<GoogleDriveBarProps> = ({
  program,
  onProgramLoadedFromDrive,
  showToast,
}) => {
  const [driveStatus, setDriveStatus] = useState<DriveAuthStatus>({ configured: false, authenticated: false });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingDriveData, setIsLoadingDriveData] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Initial check on mount
  useEffect(() => {
    checkDriveStatus().then((st) => {
      setDriveStatus(st);
    });
  }, []);

  // Automatic background sync when program updates (if connected)
  useEffect(() => {
    if (!driveStatus.authenticated) return;

    const timer = setTimeout(async () => {
      setIsSyncing(true);
      const result = await syncToDrive(program);
      setIsSyncing(false);

      if (result.success) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(timeStr);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [program, driveStatus.authenticated]);

  const handleConnect = async () => {
    setIsSyncing(true);
    const success = await loginWithDrive();
    setIsSyncing(false);

    if (success) {
      const status = await checkDriveStatus();
      setDriveStatus(status);
      showToast('☁️ ¡Conectado con Google Drive con éxito!');

      // Immediate first sync
      setIsSyncing(true);
      const syncRes = await syncToDrive(program);
      setIsSyncing(false);

      if (syncRes.success) {
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('¿Deseas desconectar tu cuenta de Google Drive?')) {
      await logoutDrive();
      setDriveStatus({ configured: true, authenticated: false });
      setLastSyncTime(null);
      showToast('Cuenta de Google Drive desconectada.');
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const syncRes = await syncToDrive(program);
    setIsSyncing(false);

    if (syncRes.success) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(timeStr);
      showToast('☁️ Progreso guardado exitosamente en Google Drive.');
    } else {
      showToast(`⚠️ Error al guardar en Drive: ${syncRes.error}`);
    }
  };

  const handleLoadFromDrive = async () => {
    setIsLoadingDriveData(true);
    const res = await loadFromDrive();
    setIsLoadingDriveData(false);

    if (res.success && res.programData) {
      onProgramLoadedFromDrive(res.programData);
      showToast('☁️ ¡Rutina y progreso cargados desde Google Drive!');
    } else {
      showToast(`⚠️ ${res.error || 'No se pudo cargar la data de Google Drive.'}`);
    }
  };

  return (
    <div className="bg-[#121212] border-b border-white/10 text-xs py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        
        {/* Status indicator */}
        <div className="flex items-center space-x-2">
          {driveStatus.authenticated ? (
            <>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CloudCheck className="w-4 h-4 text-emerald-400" />
                Sincronizado con Google Drive:
              </span>
              <span className="text-white/80 font-mono">
                {driveStatus.user?.email || driveStatus.user?.name || 'Conectado'}
              </span>
              {lastSyncTime && (
                <span className="text-white/40 text-[11px] font-mono">
                  (Guardado {lastSyncTime})
                </span>
              )}
            </>
          ) : (
            <>
              <Cloud className="w-4 h-4 text-blue-400" />
              <span className="text-white/80 font-medium">Auto-guardado en Nube:</span>
              <span className="text-white/50 hidden sm:inline">
                Guarda tu avance una sola vez e ingresa desde cualquier dispositivo
              </span>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {isSyncing && (
            <span className="flex items-center text-blue-400 font-mono text-[11px] mr-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              Guardando en Drive...
            </span>
          )}

          {driveStatus.authenticated ? (
            <>
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="inline-flex items-center px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-colors"
                title="Sincronizar cambios actuales con Google Drive"
              >
                <CloudUpload className="w-3.5 h-3.5 mr-1 text-blue-400" />
                Guardar en Drive
              </button>

              <button
                onClick={handleLoadFromDrive}
                disabled={isLoadingDriveData}
                className="inline-flex items-center px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 transition-colors"
                title="Descargar la versión más reciente guardada en Google Drive"
              >
                {isLoadingDriveData ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin text-blue-400" />
                ) : (
                  <CloudDownload className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                )}
                Cargar de Drive
              </button>

              <button
                onClick={handleDisconnect}
                className="p-1 text-white/40 hover:text-rose-400 rounded transition-colors"
                title="Desconectar Google Drive"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isSyncing}
              className="inline-flex items-center px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors shadow-sm"
            >
              <CloudUpload className="w-3.5 h-3.5 mr-1.5" />
              Conectar Google Drive
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
