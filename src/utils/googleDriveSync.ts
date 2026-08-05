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
  try {
    const res = await fetch('/api/auth/google/url');
    const data = await res.json();

    if (!data.authUrl) {
      alert('Error al obtener la URL de autenticación de Google Drive.');
      return false;
    }

    // Detect mobile device or popup block
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    if (isMobile) {
      // Direct full page redirect on mobile for maximum reliability
      window.location.href = data.authUrl;
      return false;
    }

    // Desktop popup flow
    const width = 520;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      data.authUrl,
      'GoogleDriveAuth',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    );

    if (!popup) {
      // If popup blocked, fallback to direct redirect
      window.location.href = data.authUrl;
      return false;
    }

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

      // Fallback check if user closes popup manually
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

export async function syncToDrive(program: GymProgram): Promise<{ success: boolean; lastSynced?: string; error?: string; webViewLink?: string }> {
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
      return { success: false, error: data.error || 'Error al guardar en Google Drive' };
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

export async function loadFromDrive(): Promise<{ success: boolean; programData?: GymProgram; error?: string }> {
  try {
    const res = await fetch('/api/drive/load');
    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || 'No se pudo cargar desde Google Drive' };
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
