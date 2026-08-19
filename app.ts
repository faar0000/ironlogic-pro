import express from 'express';
import cookieParser from 'cookie-parser';
import { google } from 'googleapis';
import { Readable } from 'stream';

const app = express();

const COOKIE_NAME = 'gd_tokens';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  path: '/',
};

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Normalize URLs on Vercel if /api prefix is stripped or routed differently
app.use((req, res, next) => {
  if (process.env.VERCEL && !req.url.startsWith('/api') && (req.url.startsWith('/auth') || req.url.startsWith('/drive'))) {
    req.url = `/api${req.url}`;
  }
  next();
});

// OAuth configuration helper
function getOAuth2Client(req: express.Request) {
  const clientId = process.env.CLIENT_ID ||
                   process.env.GOOGLE_CLIENT_ID ||
                   process.env.OAUTH_CLIENT_ID ||
                   process.env.GOOGLE_OAUTH_CLIENT_ID ||
                   process.env.VITE_GOOGLE_CLIENT_ID;

  const clientSecret = process.env.CLIENT_SECRET ||
                       process.env.GOOGLE_CLIENT_SECRET ||
                       process.env.OAUTH_CLIENT_SECRET ||
                       process.env.GOOGLE_OAUTH_CLIENT_SECRET ||
                       process.env.VITE_GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  let appUrl = process.env.APP_URL;

  if (!appUrl || appUrl.includes('MY_APP_URL')) {
    const rawProto = req.headers['x-forwarded-proto'];
    const protocol = Array.isArray(rawProto) ? rawProto[0] : (rawProto || req.protocol || 'https');
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    if (host) {
      appUrl = `${protocol}://${host}`;
    } else {
      appUrl = (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ||
               (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    }
  }

  if (!appUrl.startsWith('http://') && !appUrl.startsWith('https://')) {
    appUrl = `https://${appUrl}`;
  }
  appUrl = appUrl.replace(/\/$/, '');

  const redirectUri = process.env.REDIRECT_URI || `${appUrl}/api/auth/google/callback`;

  try {
    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  } catch (err) {
    console.error('Error creating OAuth2 client:', err);
    return null;
  }
}

function isAuthOrGrantError(error: any): boolean {
  const msg = error?.response?.data?.error_description ||
              error?.response?.data?.error ||
              error?.message ||
              String(error);
  const status = error?.response?.status || error?.status || error?.code;
  return (
    status === 401 ||
    status === '401' ||
    msg.includes('invalid_grant') ||
    msg.includes('invalid_token') ||
    msg.includes('Token has been expired or revoked') ||
    msg.includes('invalid_credentials') ||
    msg.includes('Unauthorized') ||
    msg.includes('Invalid Credentials')
  );
}

function parseDriveError(error: any) {
  const msg = error?.response?.data?.error?.message ||
              error?.response?.data?.error_description ||
              error?.response?.data?.error ||
              error?.message ||
              String(error);

  if (isAuthOrGrantError(error)) {
    return {
      authExpired: true,
      apiDisabled: false,
      enableUrl: undefined,
      error: 'La sesión de Google Drive ha expirado o el acceso fue revocado. Por favor vuelve a vincular tu cuenta.',
    };
  }

  if (msg.includes('Google Drive API has not been used') || msg.includes('is disabled') || msg.includes('drive.googleapis.com')) {
    const urlMatch = msg.match(/https:\/\/[^\s]+/);
    const enableUrl = urlMatch ? urlMatch[0].replace(/[.,]$/, '') : 'https://console.cloud.google.com/apis/library/drive.googleapis.com';
    return {
      authExpired: false,
      apiDisabled: true,
      enableUrl,
      error: 'La API de Google Drive no está habilitada en tu proyecto de Google Cloud.',
    };
  }

  return {
    authExpired: false,
    apiDisabled: false,
    enableUrl: undefined,
    error: msg,
  };
}

// 1. Auth Status Endpoint
app.get(['/api/auth/google/status', '/auth/google/status'], async (req, res) => {
  try {
    const oauth2Client = getOAuth2Client(req);
    if (!oauth2Client) {
      return res.json({
        configured: false,
        authenticated: false,
        message: 'Google OAuth no está configurado (faltan CLIENT_ID o CLIENT_SECRET).'
      });
    }

    const tokensCookie = req.cookies[COOKIE_NAME];
    if (!tokensCookie) {
      return res.json({ configured: true, authenticated: false });
    }

    try {
      const tokens = typeof tokensCookie === 'string' ? JSON.parse(tokensCookie) : tokensCookie;
      oauth2Client.setCredentials(tokens);

      // Listen for token updates (e.g. refreshed access_token) and update cookie
      oauth2Client.on('tokens', (newTokens) => {
        const merged = { ...tokens, ...newTokens };
        res.cookie(COOKIE_NAME, JSON.stringify(merged), {
          ...COOKIE_OPTIONS,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      });

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      return res.json({
        configured: true,
        authenticated: true,
        user: {
          name: userInfo.data.name,
          email: userInfo.data.email,
          picture: userInfo.data.picture,
        }
      });
    } catch (error: any) {
      // Clear expired / invalid credentials cookie cleanly
      res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
      if (isAuthOrGrantError(error)) {
        console.warn('Google session expired or invalid grant, cleared auth cookie.');
      } else {
        console.error('Error validating Google tokens:', error?.message || error);
      }
      return res.json({
        configured: true,
        authenticated: false,
        authExpired: true,
        message: 'Sesión expirada. Por favor vincula tu cuenta de Google Drive nuevamente.'
      });
    }
  } catch (err: any) {
    console.error('Error in status handler:', err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

// 2. Auth URL Endpoint
app.get(['/api/auth/google/url', '/auth/google/url'], (req, res) => {
  try {
    const oauth2Client = getOAuth2Client(req);
    if (!oauth2Client) {
      return res.status(400).json({
        error: 'OAuth no configurado en el servidor. Agrega CLIENT_ID y CLIENT_SECRET en las Variables de Entorno.',
        missingEnvVars: true
      });
    }

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });

    return res.json({ authUrl: url });
  } catch (err: any) {
    console.error('Error generating Google Auth URL:', err);
    return res.status(500).json({ error: `Error interno al generar URL de autenticación: ${err?.message || err}` });
  }
});

// 3. Auth Callback Endpoint
app.get(['/api/auth/google/callback', '/auth/google/callback'], async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).send('Código de autorización no proporcionado.');
    }

    const oauth2Client = getOAuth2Client(req);
    if (!oauth2Client) {
      return res.status(500).send('OAuth no configurado en el servidor.');
    }

    const { tokens } = await oauth2Client.getToken(code);

    res.cookie(COOKIE_NAME, JSON.stringify(tokens), {
      ...COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Autenticación Exitosa</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: system-ui, sans-serif; background: #0f0f0f; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 1rem; box-sizing: border-box; }
            .card { background: #1a1a1a; border: 1px solid #333; padding: 2rem; border-radius: 1rem; text-align: center; max-width: 400px; width: 100%; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>✅ Conectado con Google Drive</h2>
            <p>Redirigiendo a tu aplicación para sincronizar tus datos...</p>
          </div>
          <script>
            if (window.opener && !window.opener.closed) {
              try {
                window.opener.postMessage({ type: 'GOOGLE_OAUTH_SUCCESS' }, '*');
              } catch (e) {}
              setTimeout(() => window.close(), 600);
            }
            setTimeout(() => {
              window.location.href = '/?drive_connected=true';
            }, 800);
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Error exchanging OAuth code:', error);
    res.status(500).send(`Error de autenticación: ${error.message || error}`);
  }
});

// 4. Logout Endpoint
app.post(['/api/auth/google/logout', '/auth/google/logout'], (req, res) => {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  res.json({ success: true });
});

// 5. Diagnostic / Debug Endpoint
app.get(['/api/drive/debug', '/drive/debug'], async (req, res) => {
  try {
    const oauth2Client = getOAuth2Client(req);
    if (!oauth2Client) {
      return res.json({
        status: 'error',
        message: 'Google OAuth no está configurado (faltan CLIENT_ID o CLIENT_SECRET).',
        hasCookie: false,
        authenticated: false,
      });
    }

    const tokensCookie = req.cookies[COOKIE_NAME];
    if (!tokensCookie) {
      return res.json({
        status: 'unauthenticated',
        message: 'No existe sesión de Google Drive guardada en este navegador.',
        hasCookie: false,
        authenticated: false,
      });
    }

    try {
      const tokens = typeof tokensCookie === 'string' ? JSON.parse(tokensCookie) : tokensCookie;
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      const backupFileName = 'Gimnasio_Rutina_Backup_AutoSync.json';

      const searchRes = await drive.files.list({
        q: `name = '${backupFileName}' and trashed = false`,
        fields: 'files(id, name, modifiedTime, size, webViewLink)',
        orderBy: 'modifiedTime desc',
        spaces: 'drive',
      });

      const file = searchRes.data.files && searchRes.data.files[0] ? searchRes.data.files[0] : null;

      return res.json({
        status: 'ok',
        hasCookie: true,
        authenticated: true,
        user: {
          name: userInfo.data.name,
          email: userInfo.data.email,
        },
        backupFile: file ? {
          id: file.id,
          name: file.name,
          modifiedTime: file.modifiedTime,
          size: file.size,
          webViewLink: file.webViewLink,
        } : null,
        message: file ? '✅ Archivo de respaldo encontrado en tu Google Drive.' : '⚠️ Conectado a Google Drive, pero aún no has creado un respaldo (haz clic en Guardar en Drive).',
      });
    } catch (error: any) {
      const parsed = parseDriveError(error);
      if (parsed.authExpired) {
        res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
        return res.json({
          status: 'unauthenticated',
          hasCookie: false,
          authenticated: false,
          authExpired: true,
          message: 'Tu sesión de Google Drive ha expirado. Por favor, vuelve a vincular tu cuenta.',
        });
      }

      return res.json({
        status: 'error',
        hasCookie: true,
        authenticated: false,
        apiDisabled: parsed.apiDisabled,
        enableUrl: parsed.enableUrl,
        message: parsed.apiDisabled
          ? '⚠️ La API de Google Drive no está activada en tu proyecto de Google Cloud.'
          : `Error al verificar cuenta con Google: ${parsed.error}`,
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

// 6. Drive Sync Endpoint (Saves program backup JSON to Drive)
app.post(['/api/drive/sync', '/drive/sync'], async (req, res) => {
  try {
    const tokensCookie = req.cookies[COOKIE_NAME];
    if (!tokensCookie) {
      return res.status(401).json({ error: 'No autenticado con Google Drive.', authExpired: true });
    }

    const { programData } = req.body;
    if (!programData) {
      return res.status(400).json({ error: 'No se proporcionaron datos del programa.' });
    }

    const oauth2Client = getOAuth2Client(req);
    if (!oauth2Client) {
      return res.status(500).json({ error: 'OAuth no configurado en el servidor.' });
    }

    try {
      const tokens = typeof tokensCookie === 'string' ? JSON.parse(tokensCookie) : tokensCookie;
      oauth2Client.setCredentials(tokens);

      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      const backupFileName = 'Gimnasio_Rutina_Backup_AutoSync.json';
      const fileContent = JSON.stringify(programData, null, 2);

      const searchRes = await drive.files.list({
        q: `name = '${backupFileName}' and trashed = false`,
        fields: 'files(id, name, webViewLink, modifiedTime)',
        orderBy: 'modifiedTime desc',
        spaces: 'drive',
      });

      let fileId: string;
      let webViewLink: string | undefined;

      const stream = Readable.from([fileContent]);

      if (searchRes.data.files && searchRes.data.files.length > 0) {
        fileId = searchRes.data.files[0].id!;
        const updateRes = await drive.files.update({
          fileId,
          media: {
            mimeType: 'application/json',
            body: stream,
          },
          fields: 'id, name, webViewLink, modifiedTime',
        });
        webViewLink = updateRes.data.webViewLink || undefined;
      } else {
        const createRes = await drive.files.create({
          requestBody: {
            name: backupFileName,
            mimeType: 'application/json',
            description: 'Copia de seguridad automática del programa de entrenamiento del Gimnasio.',
          },
          media: {
            mimeType: 'application/json',
            body: stream,
          },
          fields: 'id, name, webViewLink, modifiedTime',
        });
        fileId = createRes.data.id!;
        webViewLink = createRes.data.webViewLink || undefined;
      }

      return res.json({
        success: true,
        fileId,
        fileName: backupFileName,
        lastSynced: new Date().toISOString(),
        webViewLink,
      });
    } catch (error: any) {
      const parsed = parseDriveError(error);
      if (parsed.authExpired) {
        res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
        return res.status(401).json({
          error: parsed.error,
          authExpired: true,
        });
      }

      return res.status(500).json({
        error: `Error al sincronizar con Google Drive: ${parsed.error}`,
        apiDisabled: parsed.apiDisabled,
        enableUrl: parsed.enableUrl,
      });
    }
  } catch (error: any) {
    console.error('Error in drive sync route:', error);
    return res.status(500).json({ error: error?.message || 'Error interno' });
  }
});

// 7. Drive Load Endpoint (Loads backup JSON from Drive)
app.get(['/api/drive/load', '/drive/load'], async (req, res) => {
  try {
    const tokensCookie = req.cookies[COOKIE_NAME];
    if (!tokensCookie) {
      return res.status(401).json({ error: 'No autenticado con Google Drive.', authExpired: true });
    }

    const oauth2Client = getOAuth2Client(req);
    if (!oauth2Client) {
      return res.status(500).json({ error: 'OAuth no configurado en el servidor.' });
    }

    try {
      const tokens = typeof tokensCookie === 'string' ? JSON.parse(tokensCookie) : tokensCookie;
      oauth2Client.setCredentials(tokens);

      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      const backupFileName = 'Gimnasio_Rutina_Backup_AutoSync.json';

      const searchRes = await drive.files.list({
        q: `name = '${backupFileName}' and trashed = false`,
        fields: 'files(id, name, modifiedTime)',
        orderBy: 'modifiedTime desc',
        spaces: 'drive',
      });

      if (!searchRes.data.files || searchRes.data.files.length === 0) {
        return res.status(404).json({ error: 'No se encontró ningún respaldo en tu Google Drive.' });
      }

      const fileId = searchRes.data.files[0].id!;
      const fileRes = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'text' }
      );

      let programData = fileRes.data;
      if (typeof programData === 'string') {
        try {
          programData = JSON.parse(programData);
        } catch (e) {
          console.error('Error parsing JSON content from Drive:', e);
        }
      }

      return res.json({
        success: true,
        programData,
        modifiedTime: searchRes.data.files[0].modifiedTime,
      });
    } catch (error: any) {
      const parsed = parseDriveError(error);
      if (parsed.authExpired) {
        res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
        return res.status(401).json({
          error: parsed.error,
          authExpired: true,
        });
      }

      return res.status(500).json({
        error: `Error al cargar desde Google Drive: ${parsed.error}`,
        apiDisabled: parsed.apiDisabled,
        enableUrl: parsed.enableUrl,
      });
    }
  } catch (error: any) {
    console.error('Error in drive load route:', error);
    return res.status(500).json({ error: error?.message || 'Error interno' });
  }
});

export default app;
