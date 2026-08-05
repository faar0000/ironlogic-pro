import React, { useState, useEffect } from 'react';
import { Cloud, CloudCheck, CloudUpload, CloudDownload, LogOut, Loader2 } from 'lucide-react';
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
  const [hasLoadedFromDrive, setHasLoadedFromDrive] = useState(false);

  // Initial check on mount: if authenticated, auto-load backup from Drive
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isJustConnected = urlParams.get('drive_connected') === 'true';
    if (isJustConnected) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    checkDriveStatus().then(async (st) => {
      setDriveStatus(st);
      if (st.authenticated) {
        setIsLoadingDriveData(true);
        const res = await loadFromDrive();
        setIsLoadingDriveData(false);

        if (res.success && res.programData) {
          onProgramLoadedFromDrive(res.programData);
          showToast(isJustConnected ? '☁️ ¡Conectado a Google Drive y datos cargados con éxito!' : '☁️ ¡Datos sincronizados desde Google Drive!');
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setLastSyncTime(timeStr);
        } else if (isJustConnected) {
          showToast('☁️ Conectado a Google Drive.');
        }
        setHasLoadedFromDrive(true);
      }
    });
  }, []);

  // Automatic background sync when program updates (only AFTER drive initial load is complete)
  useEffect(() => {
    if (!driveStatus.authenticated || !hasLoadedFromDrive) return;

    const timer = setTimeout(async () => {
      setIsSyncing(true);
      const result = await syncToDrive(program);
      setIsSyncing(false);

      if (result.success) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(timeStr);
      }
    }, 2000); // 2s debounce

    return () => clearTimeout(timer);
  }, [program, driveStatus.authenticated, hasLoadedFromDrive]);

  const handleConnect = async () => {
    setIsSyncing(true);
    const success = await loginWithDrive();
    setIsSyncing(false);

    if (success) {
      const status = await checkDriveStatus();
      setDriveStatus(status);

      // FIRST: Check if Drive already has existing backup data from desktop/other session
      setIsLoadingDriveData(true);
      const res = await loadFromDrive();
      setIsLoadingDriveData(false);

      if (res.success && res.programData) {
        onProgramLoadedFromDrive(res.programData);
        setHasLoadedFromDrive(true);
        showToast('☁️ ¡Conectado a Google Drive! Tu rutina guardada ha sido cargada.');
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(timeStr);
      } else {
        // No backup exists in Drive yet, create initial backup with current local program
        setIsSyncing(true);
        const syncRes = await syncToDrive(program);
        setIsSyncing(false);
        setHasLoadedFromDrive(true);

        if (syncRes.success) {
          showToast('☁️ ¡Conectado a Google Drive! Se creó tu primera copia de seguridad.');
          setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else {
          showToast(`⚠️ Conectado, pero hubo un error al guardar: ${syncRes.error}`);
        }
      }
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('¿Deseas desconectar tu cuenta de Google Drive?')) {
      await logoutDrive();
      setDriveStatus({ configured: true, authenticated: false });
      setHasLoadedFromDrive(false);
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
      showToast('📤 ¡Progreso subido y guardado exitosamente en Google Drive!');
    } else {
      showToast(`⚠️ Error al guardar en Drive: ${syncRes.error}`);
    }
  };

  const handleLoadFromDrive = async () => {
    if (window.confirm('¿Deseas descargar la versión más reciente guardada en Google Drive? Reemplazará la vista actual.')) {
      setIsLoadingDriveData(true);
      const res = await loadFromDrive();
      setIsLoadingDriveData(false);

      if (res.success && res.programData) {
        onProgramLoadedFromDrive(res.programData);
        setHasLoadedFromDrive(true);
        showToast('📥 ¡Rutina y progreso cargados exitosamente desde Google Drive!');
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(timeStr);
      } else {
        showToast(`⚠️ ${res.error || 'No se encontró archivo de respaldo en tu Google Drive.'}`);
      }
    }
  };

  return (
    <div className="bg-[#121212] border-b border-white/10 text-xs py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
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
                Google Drive Conectado:
              </span>
              <span className="text-white/80 font-mono text-[11px] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                {driveStatus.user?.email || driveStatus.user?.name || 'Usuario'}
              </span>
              {lastSyncTime && (
                <span className="text-white/40 text-[11px] font-mono hidden md:inline">
                  (Auto-guardado {lastSyncTime})
                </span>
              )}
            </>
          ) : (
            <>
              <Cloud className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-white/90 font-medium">Sincronización Multidispositivo:</span>
              <span className="text-white/50 hidden sm:inline">
                Conecta tu Google Drive para mantener tu celular y computadora sincronizados
              </span>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {(isSyncing || isLoadingDriveData) && (
            <span className="flex items-center text-blue-400 font-mono text-[11px] mr-2 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-blue-400" />
              {isLoadingDriveData ? 'Descargando de Drive...' : 'Subiendo a Drive...'}
            </span>
          )}

          {driveStatus.authenticated ? (
            <>
              {/* BOTÓN 1: GUARDAR (SUBIR) */}
              <button
                onClick={handleManualSync}
                disabled={isSyncing || isLoadingDriveData}
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs border border-blue-400/30 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                title="Sube y sobrescribe tu copia en Google Drive con los datos locales actuales"
              >
                <CloudUpload className="w-4 h-4 mr-1.5 text-blue-100" />
                Guardar en Drive
              </button>

              {/* BOTÓN 2: CARGAR (DESCARGAR) */}
              <button
                onClick={handleLoadFromDrive}
                disabled={isSyncing || isLoadingDriveData}
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs border border-emerald-400/30 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                title="Descarga y restaura los datos guardados en tu Google Drive a esta pantalla"
              >
                <CloudDownload className="w-4 h-4 mr-1.5 text-emerald-100" />
                Cargar de Drive
              </button>

              <button
                onClick={handleDisconnect}
                className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
                title="Desconectar cuenta de Google Drive"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isSyncing || isLoadingDriveData}
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95"
            >
              <CloudUpload className="w-4 h-4 mr-1.5 text-blue-200" />
              Conectar Google Drive
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
