import { GymProgram } from '../types';

export interface DriveUser {
  name?: string;
  email?: string;
  picture?: string;
}

export interface DriveAuthStatus {
  configured: boolean;
  authenticated: boolean;
  user?: DriveUser;
  message?: string;
}

export async function checkDriveStatus(): Promise<DriveAuthStatus> {
  try {
    const res = await fetch('/api/auth/google/status');
    if (!res.ok) {
      return { configured: false, authenticated: false };
    }
    return await res.json();
  } catch (e) {
    console.error('Error checking Drive status:', e);
    return { configured: false, authenticated: false };
  }
}

export async function loginWithDrive(): Promise<boolean> {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

  let popup: Window | null = null;
  if (!isMobile) {
    // Open blank popup synchronously on user click to bypass browser popup blockers
    const width = 520;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    popup = window.open(
      'about:blank',
      'GoogleDriveAuth',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    );
  }

  try {
    const res = await fetch('/api/auth/google/url');
    let data: any = {};
    let rawText = '';
    try {
      rawText = await res.text();
      data = JSON.parse(rawText);
    } catch (e) {
      // Catch JSON parse errors (e.g. if server returned HTML 404/500 page)
    }

    if (!res.ok || !data.authUrl) {
      if (popup && !popup.closed) popup.close();

      let errorMsg = data.error;
      if (!errorMsg) {
        if (res.status === 404) {
          errorMsg = 'Servidor backend no encontrado (404). Verifica que las funciones serverless de Vercel estén desplegadas.';
        } else if (rawText && rawText.length < 300) {
          errorMsg = `Error ${res.status}: ${rawText}`;
        } else {
          errorMsg = `Error HTTP ${res.status} (${res.statusText || 'Error desconocido'})`;
        }
      }

      alert(`Error al conectar con Google Drive:\n\n${errorMsg}`);
      return false;
    }

    if (isMobile || !popup) {
      // Direct full page redirect for mobile or if popup was blocked
      window.location.href = data.authUrl;
      return false;
    }

    // Redirect the pre-opened popup to Google's OAuth URL
    popup.location.href = data.authUrl;

    return new Promise((resolve) => {
      let resolved = false;

      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          if (popup && !popup.closed) popup.close();
          resolved = true;
          resolve(true);
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was closed by user
      const timer = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(timer);
          window.removeEventListener('message', handleMessage);
          if (!resolved) {
            checkDriveStatus().then((st) => resolve(st.authenticated));
          }
        }
      }, 1000);
    });
  } catch (e) {
    console.error('Error initiating Drive login:', e);
    if (popup && !popup.closed) popup.close();
    alert('Error de conexión al intentar iniciar sesión con Google Drive.');
    return false;
  }
}

export async function logoutDrive(): Promise<boolean> {
  try {
    await fetch('/api/auth/google/logout', { method: 'POST' });
    return true;
  } catch (e) {
    console.error('Error logging out Drive:', e);
    return false;
  }
}

export async function syncToDrive(program: GymProgram): Promise<{ success: boolean; lastSynced?: string; error?: string; webViewLink?: string; apiDisabled?: boolean; enableUrl?: string }> {
  try {
    const res = await fetch('/api/drive/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programData: program,
        fileName: program.fileName,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Error al guardar en Google Drive',
        apiDisabled: data.apiDisabled,
        enableUrl: data.enableUrl,
      };
    }

    return {
      success: true,
      lastSynced: data.lastSynced,
      webViewLink: data.webViewLink,
    };
  } catch (e: any) {
    console.error('Error syncing to Drive:', e);
    return { success: false, error: e.message || 'Error de conexión' };
  }
}

export async function loadFromDrive(): Promise<{ success: boolean; programData?: GymProgram; error?: string; apiDisabled?: boolean; enableUrl?: string }> {
  try {
    const res = await fetch('/api/drive/load');
    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'No se pudo cargar desde Google Drive',
        apiDisabled: data.apiDisabled,
        enableUrl: data.enableUrl,
      };
    }

    let programData = data.programData;
    if (typeof programData === 'string') {
      try {
        programData = JSON.parse(programData);
      } catch (e) {
        console.error('Error parsing programData JSON:', e);
      }
    }

    if (!programData || !Array.isArray(programData.workoutDays)) {
      return { success: false, error: 'El archivo guardado en Google Drive no tiene un formato válido.' };
    }

    return {
      success: true,
      programData,
    };
  } catch (e: any) {
    console.error('Error loading from Drive:', e);
    return { success: false, error: e.message || 'Error de red' };
  }
}

export async function debugDriveSync(): Promise<any> {
  try {
    const res = await fetch('/api/drive/debug');
    return await res.json();
  } catch (e: any) {
    return { status: 'error', message: e.message || 'Error de red al conectar al servidor' };
  }
}
