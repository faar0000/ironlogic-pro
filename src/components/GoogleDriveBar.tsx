import React, { useState, useEffect } from 'react';
import { Cloud, CloudCheck, CloudUpload, CloudDownload, LogOut, Loader2, Bug, CheckCircle2, XCircle, RefreshCw, FileJson, X, AlertTriangle } from 'lucide-react';
import { GymProgram } from '../types';
import { checkDriveStatus, loginWithDrive, logoutDrive, syncToDrive, loadFromDrive, debugDriveSync, DriveAuthStatus } from '../utils/googleDriveSync';

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
  const [apiDisabledError, setApiDisabledError] = useState<{ apiDisabled: boolean; enableUrl?: string } | null>(null);

  // Debug Modal state
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [isDebugLoading, setIsDebugLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsDebugLoading(true);
    const result = await debugDriveSync();
    setDebugData(result);
    setIsDebugLoading(false);
  };

  const handleOpenDebug = () => {
    setShowDebugModal(true);
    runDiagnostics();
  };

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
        } else {
          // No backup found on Drive yet -> Save current local/imported program as initial backup
          setIsSyncing(true);
          const initialSync = await syncToDrive(program);
          setIsSyncing(false);
          if (initialSync.success) {
            showToast('☁️ ¡Conectado a Google Drive y rutina actual guardada como primer respaldo!');
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLastSyncTime(timeStr);
          } else if (isJustConnected) {
            showToast('☁️ Conectado a Google Drive.');
          }
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

  const handleSaveAction = async () => {
    if (!driveStatus.authenticated) {
      showToast('🔑 Iniciando sesión en Google Drive...');
      const success = await loginWithDrive();
      if (success) {
        const st = await checkDriveStatus();
        setDriveStatus(st);
        showToast('☁️ ¡Conectado! Guardando tu rutina en Google Drive...');
        await handleManualSync();
      } else {
        showToast('⚠️ No se pudo completar la conexión con Google Drive.');
      }
    } else {
      await handleManualSync();
    }
  };

  const handleLoadAction = async () => {
    if (!driveStatus.authenticated) {
      showToast('🔑 Iniciando sesión en Google Drive...');
      const success = await loginWithDrive();
      if (success) {
        const st = await checkDriveStatus();
        setDriveStatus(st);
        showToast('☁️ ¡Conectado! Buscando tu archivo de respaldo en Google Drive...');
        await handleLoadFromDrive();
      } else {
        showToast('⚠️ No se pudo completar la conexión con Google Drive.');
      }
    } else {
      await handleLoadFromDrive();
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const syncRes = await syncToDrive(program);
    setIsSyncing(false);

    if (syncRes.apiDisabled) {
      setApiDisabledError({ apiDisabled: true, enableUrl: syncRes.enableUrl });
    }

    if (syncRes.success) {
      setApiDisabledError(null);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(timeStr);
      showToast('📤 ¡Progreso subido y guardado exitosamente en Google Drive!');
      if (showDebugModal) runDiagnostics();
    } else {
      showToast(`⚠️ Error al guardar en Drive: ${syncRes.error}`);
    }
  };

  const handleLoadFromDrive = async () => {
    setIsLoadingDriveData(true);
    const res = await loadFromDrive();
    setIsLoadingDriveData(false);

    if (res.apiDisabled) {
      setApiDisabledError({ apiDisabled: true, enableUrl: res.enableUrl });
    }

    if (res.success && res.programData) {
      setApiDisabledError(null);
      onProgramLoadedFromDrive(res.programData);
      setHasLoadedFromDrive(true);
      showToast('📥 ¡Rutina y progreso cargados exitosamente desde Google Drive!');
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(timeStr);
      if (showDebugModal) runDiagnostics();
    } else {
      showToast(`⚠️ ${res.error || 'No se encontró archivo de respaldo en tu Google Drive.'}`);
    }
  };

  return (
    <>
      {apiDisabledError && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 py-2.5 px-4 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold text-amber-300">⚠️ La API de Google Drive no está habilitada en tu proyecto de Google Cloud Console.</span>
                <p className="text-amber-200/80 text-[11px] mt-0.5">
                  Haz clic en el botón para activarla en tu consola de Google Cloud (Project ID: 1090977520577) y luego intenta guardar de nuevo.
                </p>
              </div>
            </div>
            <a
              href={apiDisabledError.enableUrl || 'https://console.cloud.google.com/apis/library/drive.googleapis.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-all shrink-0 flex items-center gap-1 shadow-md"
            >
              Habilitar Google Drive API ↗
            </a>
          </div>
        </div>
      )}

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

          {/* Action Controls - ALWAYS VISIBLE */}
          <div className="flex flex-wrap items-center gap-2">
            {(isSyncing || isLoadingDriveData) && (
              <span className="flex items-center text-blue-400 font-mono text-[11px] bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-blue-400" />
                {isLoadingDriveData ? 'Descargando...' : 'Guardando...'}
              </span>
            )}

            {/* BOTÓN 1: GUARDAR EN DRIVE (Azul) */}
            <button
              onClick={handleSaveAction}
              disabled={isSyncing || isLoadingDriveData}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs border border-blue-400/30 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Guardar: Subir y actualizar copia de seguridad en Google Drive"
            >
              <CloudUpload className="w-4 h-4 mr-1.5 text-blue-100" />
              Guardar en Drive
            </button>

            {/* BOTÓN 2: CARGAR DE DRIVE (Esmeralda) */}
            <button
              onClick={handleLoadAction}
              disabled={isSyncing || isLoadingDriveData}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs border border-emerald-400/30 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Cargar: Descargar e importar copia guardada desde Google Drive"
            >
              <CloudDownload className="w-4 h-4 mr-1.5 text-emerald-100" />
              Cargar de Drive
            </button>

            {/* BOTÓN 3: DEPURAR / DIAGNÓSTICO */}
            <button
              onClick={handleOpenDebug}
              className="inline-flex items-center p-1.5 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors cursor-pointer"
              title="Estado y diagnóstico de conexión con Google Drive"
            >
              <Bug className="w-4 h-4 text-amber-400" />
            </button>

            {/* SI ESTÁ AUTENTICADO: MOSTRAR LOGOUT; SI NO: BOTÓN DE CONECTAR OPCIONAL */}
            {driveStatus.authenticated ? (
              <button
                onClick={handleDisconnect}
                className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-0.5 cursor-pointer"
                title="Desconectar cuenta de Google Drive"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isSyncing || isLoadingDriveData}
                className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-medium text-xs border border-white/10 transition-all cursor-pointer"
                title="Conectar o vincular cuenta de Google Drive"
              >
                <Cloud className="w-3.5 h-3.5 mr-1 text-blue-400" />
                Vincular
              </button>
            )}
          </div>

        </div>
      </div>

      {/* MODAL DE DEPURACIÓN / DIAGNÓSTICO */}
      {showDebugModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Bug className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg text-white">Diagnóstico de Google Drive</h3>
              </div>
              <button
                onClick={() => setShowDebugModal(false)}
                className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isDebugLoading ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                <p className="text-sm text-white/60 font-mono">Comprobando conexión y estado de Google Drive...</p>
              </div>
            ) : debugData ? (
              <div className="space-y-4 text-xs font-mono">
                {/* Status card */}
                <div className={`p-4 rounded-xl border ${debugData.authenticated ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    {debugData.authenticated ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                    <span>{debugData.authenticated ? 'Conectado Correctamente' : 'No Conectado o Cookie Expirada'}</span>
                  </div>
                  <p className="mt-1 text-white/80 font-sans text-xs">{debugData.message}</p>
                </div>

                {/* Details list */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2 text-white/80">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-white/40">Sesión en navegador:</span>
                    <span className={debugData.hasCookie ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                      {debugData.hasCookie ? 'Cookie Detectada' : 'Sin Cookie'}
                    </span>
                  </div>

                  {debugData.user && (
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-white/40">Cuenta de Google:</span>
                      <span className="text-blue-300 font-semibold">{debugData.user.email}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-white/40">Archivo de Respaldo:</span>
                    <span className={debugData.backupFile ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                      {debugData.backupFile ? 'Encontrado en Drive' : 'No creado aún'}
                    </span>
                  </div>

                  {debugData.backupFile && (
                    <>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/40">Nombre del archivo:</span>
                        <span className="text-white/90">{debugData.backupFile.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-white/40">Última modificación:</span>
                        <span className="text-white/90">{new Date(debugData.backupFile.modifiedTime).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">ID de archivo Drive:</span>
                        <span className="text-white/60 text-[10px]">{debugData.backupFile.id}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Action buttons inside diagnostic */}
                <div className="pt-2 flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={runDiagnostics}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-sans text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-comprobar</span>
                  </button>

                  {debugData.authenticated && (
                    <>
                      <button
                        onClick={handleManualSync}
                        disabled={isSyncing || isLoadingDriveData}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs flex items-center space-x-1.5 transition-colors"
                      >
                        <CloudUpload className="w-3.5 h-3.5" />
                        <span>Forzar Guardar</span>
                      </button>

                      <button
                        onClick={handleLoadFromDrive}
                        disabled={isSyncing || isLoadingDriveData}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs flex items-center space-x-1.5 transition-colors"
                      >
                        <CloudDownload className="w-3.5 h-3.5" />
                        <span>Forzar Cargar</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : null}

          </div>
        </div>
      )}
    </>
  );
};

