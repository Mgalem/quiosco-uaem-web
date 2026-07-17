/**
 * Notificador de escritorio del Quiosco UAEM.
 * Corre en segundo plano en la PC del ENCARGADO (aunque el panel esté cerrado):
 * revisa el servidor cada cierto tiempo y muestra una notificación de Windows
 * cuando llega una pregunta nueva de su área.
 *
 * Configúralo en "notificador-config.json" (usuario, contraseña, IP del servidor).
 * Arranca con "Iniciar Notificador.bat" o instala el auto-inicio con
 * "Instalar Notificador (autoarranque).bat".
 */
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

let cfg;
try {
  cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'notificador-config.json'), 'utf8'));
} catch (e) {
  console.error('No se pudo leer notificador-config.json:', e.message);
  process.exit(1);
}

const BASE = (cfg.serverUrl || 'http://localhost:3001').replace(/\/+$/, '');
const INTERVALO = Math.max(5, cfg.intervaloSegundos || 20) * 1000;
let token = null;
let vistos = null; // Set de ids ya conocidos (null = aún no hicimos la 1ª revisión)

function notificar(titulo, cuerpo) {
  execFile('powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden',
     '-File', path.join(__dirname, 'toast.ps1'), titulo, cuerpo],
    () => {});
}

async function login() {
  try {
    const r = await fetch(BASE + '/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: cfg.usuario, password: cfg.password }),
    });
    const j = await r.json();
    if (j && j.token) { token = j.token; console.log('[notificador] sesión iniciada como', cfg.usuario); return true; }
    console.error('[notificador] login falló:', (j && j.error) || 'sin respuesta');
  } catch (e) { /* servidor apagado; se reintenta en la próxima vuelta */ }
  return false;
}

async function revisar() {
  try {
    if (!token && !(await login())) return;
    const r = await fetch(BASE + '/api/pendientes', { headers: { Authorization: 'Bearer ' + token } });
    if (r.status === 401) { token = null; return; } // sesión cerrada → reintenta login
    const j = await r.json();
    const items = j.pendientes || [];
    if (vistos === null) { vistos = new Set(items.map(p => p.id)); return; } // 1ª vez: no avisar de las viejas
    for (const p of items) {
      if (!vistos.has(p.id)) {
        vistos.add(p.id);
        notificar('🦌 Nueva pregunta — ' + (p.areaLabel || 'UAEM'), p.pregunta);
        console.log('[notificador] aviso:', p.pregunta);
      }
    }
  } catch (e) { /* red caída; se reintenta */ }
}

console.log('[notificador] activo · servidor:', BASE, '· usuario:', cfg.usuario, '· cada', INTERVALO / 1000, 's');
revisar();
setInterval(revisar, INTERVALO);
