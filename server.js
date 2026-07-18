/**
 * Servidor del Quiosco UAEM — Subsede Totolapan
 * ────────────────────────────────────────────────────────────────
 *  1) Bot "Venado/Beni":  POST /api/chat  { question, area }  →  Ollama (RAG)
 *  2) Panel Administrativo (maestros/guardianes):  GET /admin
 *     - Login con roles (Administrador General / Guardián de área)
 *     - Preguntas pendientes, Respuestas guardadas, Documentación, Usuarios
 *
 * Sin dependencias externas (Node 18+): usa http, fs y crypto integrados.
 * Arranca con:  npm start   (o: node server.js)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─────────────────────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const MAX_CONOCIMIENTO = 7000; // caracteres máx. de contexto por pregunta

// ── Motor de IA ───────────────────────────────────────────────
// Dos modos, según lo que soporte el hosting:
//   A) Ollama local (por defecto): OLLAMA_URL + OLLAMA_MODEL.
//   B) API en la nube compatible con OpenAI (Groq, OpenAI, OpenRouter…):
//      define LLM_API_KEY (y opcional LLM_BASE_URL, LLM_MODEL). Si hay API key,
//      se usa la nube y ya no hace falta Ollama.
const LLM_API_KEY  = process.env.LLM_API_KEY  || '';
const LLM_BASE_URL = (process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
const LLM_MODEL    = process.env.LLM_MODEL    || 'llama-3.1-8b-instant';
const OLLAMA_URL   = (process.env.OLLAMA_URL  || 'http://localhost:11434').replace(/\/+$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';
const USAR_NUBE    = !!LLM_API_KEY;
const MODELO_ACTUAL = USAR_NUBE ? (LLM_MODEL + ' @ ' + LLM_BASE_URL) : (OLLAMA_MODEL + ' @ ' + OLLAMA_URL);

const DIR_DATOS  = path.join(__dirname, 'datos');
const DIR_DOC    = path.join(__dirname, 'documentacion');
const DIR_PUBLIC = path.join(__dirname, 'public');
fs.mkdirSync(DIR_DATOS, { recursive: true });
fs.mkdirSync(DIR_DOC, { recursive: true });

// Áreas del panel (cada una tiene su encargado/guardián). Las carreras son áreas
// propias; "Becas" agrupa becas, prácticas profesionales, servicio social y seguro.
const AREAS = [
  { id: 'informatica',         label: 'Informática' },
  { id: 'derecho',             label: 'Derecho' },
  { id: 'administracion',      label: 'Administración' },
  { id: 'contador-publico',    label: 'Contador Público' },
  { id: 'servicios-escolares', label: 'Servicios Escolares' },
  { id: 'titulaciones',        label: 'Titulaciones' },
  { id: 'becas',               label: 'Becas, Prácticas Profesionales, Servicio Social y Seguro Facultativo' },
];
const ES_AREA = (id) => AREAS.some(a => a.id === id);
const LABEL_AREA = (id) => (AREAS.find(a => a.id === id) || {}).label || id;

// Traduce el código que manda el quiosco al área del panel.
// Las carreras (informatica, derecho, etc.) ya son áreas propias. Las preguntas
// "generales" o de "Programas educativos" sin carrera no tienen encargado
// específico → van al buzón general, que solo ve el administrador.
function areaPanel(code) {
  if (!code) return 'general';
  if (ES_AREA(code)) return code;
  return 'general';
}

// ─────────────────────────────────────────────────────────────
// Persistencia sencilla en JSON
// ─────────────────────────────────────────────────────────────
function leerJSON(archivo, def) {
  try {
    const f = path.join(DIR_DATOS, archivo);
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch (e) { console.warn(`[datos] no se pudo leer ${archivo}:`, e.message); }
  return def;
}
function guardarJSON(archivo, data) {
  try { fs.writeFileSync(path.join(DIR_DATOS, archivo), JSON.stringify(data, null, 2), 'utf8'); }
  catch (e) { console.error(`[datos] error al guardar ${archivo}:`, e.message); }
}

let usuarios      = leerJSON('usuarios.json', []);
let pendientes    = leerJSON('pendientes.json', []);
let respuestas    = leerJSON('respuestas.json', []);
let _seqPend = pendientes.reduce((m, n) => Math.max(m, n.id || 0), 0);
let _seqResp = respuestas.reduce((m, n) => Math.max(m, n.id || 0), 0);

// ─────────────────────────────────────────────────────────────
// Usuarios y autenticación (crypto nativo, sin dependencias)
// ─────────────────────────────────────────────────────────────
function hashPass(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}
function crearUsuario({ usuario, password, nombre, rol, area }) {
  const salt = crypto.randomBytes(16).toString('hex');
  return {
    usuario: usuario.trim(),
    nombre: (nombre || usuario).trim(),
    rol,                                   // 'admin' | 'guardian'
    area: rol === 'guardian' ? area : null,
    salt,
    hash: hashPass(password, salt),
    creado: new Date().toISOString(),
  };
}
// Sembrar administrador la primera vez. La contraseña sale de ADMIN_PASSWORD
// (defínela al desplegar); si no, usa 'admin123' (cámbiala en el panel).
if (!usuarios.length) {
  const passAdmin = process.env.ADMIN_PASSWORD || 'admin123';
  usuarios.push(crearUsuario({
    usuario: 'admin', password: passAdmin,
    nombre: 'Administrador General', rol: 'admin',
  }));
  guardarJSON('usuarios.json', usuarios);
  console.log('[auth] Usuario inicial "admin" creado' +
    (process.env.ADMIN_PASSWORD ? ' (contraseña de ADMIN_PASSWORD)' : ' con contraseña admin123 — cámbiala en el panel'));
}

// Sesiones PERSISTENTES en disco: el login sigue activo aunque se apague o
// reinicie el servidor/PC. Solo se borra cuando el usuario cierra sesión (Salir).
let sesiones = leerJSON('sesiones.json', {}); // { token: { usuario, creado } }
function guardarSesiones() { guardarJSON('sesiones.json', sesiones); }

function login(usuario, password) {
  const u = usuarios.find(x => x.usuario.toLowerCase() === (usuario || '').trim().toLowerCase());
  if (!u) return null;
  if (hashPass(password, u.salt) !== u.hash) return null;
  const token = crypto.randomBytes(24).toString('hex');
  sesiones[token] = { usuario: u.usuario, creado: new Date().toISOString() };
  guardarSesiones();
  return { token, usuario: publico(u) };
}
function publico(u) { return { usuario: u.usuario, nombre: u.nombre, rol: u.rol, area: u.area, creado: u.creado }; }
function usuarioDeToken(token) {
  const s = sesiones[token];
  if (!s) return null;                                   // sin expiración
  return usuarios.find(x => x.usuario === s.usuario) || null;
}
function cerrarSesion(token) { if (sesiones[token]) { delete sesiones[token]; guardarSesiones(); } }
function tokenDeReq(req) {
  const h = req.headers['authorization'] || '';
  if (h.startsWith('Bearer ')) return h.slice(7).trim();
  return (req.headers['x-token'] || '').trim();
}
// ¿El usuario puede ver/actuar sobre esta área del panel?
function cubreArea(u, area) {
  if (!u) return false;
  if (u.rol === 'admin') return true;
  return u.area === area;
}

// ─────────────────────────────────────────────────────────────
// Base de conocimiento: documentacion/<area>/*.txt|*.md  +  respuestas aprendidas
// ─────────────────────────────────────────────────────────────
function archivosDoc(area) {
  const dir = path.join(DIR_DOC, area);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => /\.(txt|md)$/i.test(f))
    .map(f => {
      const full = path.join(dir, f);
      let tamano = 0;
      try { tamano = fs.statSync(full).size; } catch {}
      return { nombre: f, tamano, ruta: full };
    });
}

function leerDoc(area) {
  return archivosDoc(area).map(a => {
    try { return fs.readFileSync(a.ruta, 'utf8'); } catch { return ''; }
  }).join('\n\n');
}

// Conocimiento a inyectar para una pregunta del quiosco (según su área)
function conocimientoPara(code) {
  const area = areaPanel(code);
  let texto = leerDoc(area); // lee documentacion/<area>/ (incluye "general" si existe)

  // Sumar respuestas ya aprendidas para esta área
  const aprendidas = respuestas
    .filter(r => r.area === area)
    .map(r => `P: ${r.pregunta}\nR: ${r.respuesta}`)
    .join('\n\n');
  if (aprendidas) texto += '\n\n[Respuestas frecuentes ya resueltas por un maestro]\n' + aprendidas;

  return texto.slice(0, MAX_CONOCIMIENTO).trim();
}

// ─────────────────────────────────────────────────────────────
// Prompt + llamada a Ollama
// ─────────────────────────────────────────────────────────────
const BASE_CONTEXT = `
Eres "Beni", un venado joven, simpático y muy carismático 🦌, la mascota y asistente
virtual de la UAEM, Escuela de Estudios Superiores de Atlatlahuacan, Subsede Totolapan.
Atiendes a estudiantes y visitantes en un quiosco interactivo.

Tu personalidad:
- Eres amable, alegre y con buen humor. Saludas con energía y de vez en cuando sueltas
  un comentario simpático o una bromita ligera (incluso alguna de venado, tipo
  "¡me cuernan las ganas de ayudarte!"), pero sin exagerar ni distraerte del tema.
- Usas algún emoji con moderación (🦌 ✨ 😄 📚), no en cada frase.
- Hablas en español, de "tú", claro y breve (2 a 5 frases). Cálido y cercano, como un
  compañero de la escuela que te echa la mano.

Reglas que NUNCA rompes:
- Usa SOLO la INFORMACIÓN OFICIAL de abajo como fuente de verdad.
- Si la respuesta NO está en esa información, JAMÁS la inventes. Contesta con simpatía,
  usa exactamente las palabras "No tengo esa información todavía" y sugiere pasar a
  Servicios Escolares. Nunca inventes materias, créditos, fechas, horarios, montos,
  nombres ni requisitos: si no lo sabes, lo dices y ya.
- No te salgas de tu papel de asistente de la subsede.
`.trim();

function construirPrompt(code) {
  let p = BASE_CONTEXT;
  const doc = conocimientoPara(code);
  if (doc) {
    p += '\n\n===== INFORMACIÓN OFICIAL DE LA UAEM =====\n' + doc +
         '\n===== FIN DE LA INFORMACIÓN OFICIAL =====';
  } else {
    p += '\n\n(No hay documentación cargada para esta área; si no sabes la respuesta, ' +
         'di "No tengo esa información todavía".)';
  }
  return p;
}

async function askIA(question, code) {
  const messages = [
    { role: 'system', content: construirPrompt(code) },
    { role: 'user', content: question },
  ];

  if (USAR_NUBE) {
    // API en la nube compatible con OpenAI (Groq / OpenAI / OpenRouter…)
    const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + LLM_API_KEY },
      body: JSON.stringify({ model: LLM_MODEL, temperature: 0.3, messages }),
    });
    if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
    const data = await res.json();
    const answer = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '').trim();
    if (!answer) throw new Error('La API devolvió respuesta vacía');
    return answer;
  }

  // Ollama local
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL, stream: false,
      options: { temperature: 0.3, num_ctx: 8192 },
      messages,
    }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
  const data = await res.json();
  const answer = (data && data.message && data.message.content || '').trim();
  if (!answer) throw new Error('Ollama devolvió respuesta vacía');
  return answer;
}

function pareceSinRespuesta(t) {
  t = (t || '').toLowerCase();
  return ['no tengo esa informaci', 'no tengo información', 'no tengo informacion',
    'no cuento con', 'no dispongo', 'no encontré', 'no encontre', 'no puedo responder',
    'no sé', 'no se especifica', 'servicios escolares'].some(s => t.includes(s));
}

// ─────────────────────────────────────────────────────────────
// Preguntas pendientes / respuestas aprendidas
// ─────────────────────────────────────────────────────────────
function registrarPendiente(code, pregunta, intentoBot, quien) {
  const area = areaPanel(code);
  const p = {
    id: ++_seqPend,
    fecha: new Date().toISOString(),
    area,                 // área del panel (para el guardián)
    areaCode: code || '', // código exacto del quiosco (ej. informatica)
    areaLabel: area === 'general' ? 'General' : LABEL_AREA(area),
    pregunta,
    intentoBot: intentoBot || null,
    quien: quien || null, // estudiante que preguntó (nombre, correo, matrícula)
  };
  pendientes.push(p);
  if (pendientes.length > 800) pendientes = pendientes.slice(-800);
  guardarJSON('pendientes.json', pendientes);
  return p;
}

function responderPendiente(id, respuesta, autor) {
  const i = pendientes.findIndex(p => p.id === Number(id));
  if (i < 0) return { ok: false, error: 'La pregunta ya no existe' };
  const p = pendientes[i];
  const r = {
    id: ++_seqResp,
    area: p.area, areaCode: p.areaCode, areaLabel: p.areaLabel,
    pregunta: p.pregunta, respuesta: respuesta.trim(),
    autor: autor, fecha: new Date().toISOString(),
  };
  respuestas.push(r);
  pendientes.splice(i, 1);
  guardarJSON('respuestas.json', respuestas);
  guardarJSON('pendientes.json', pendientes);
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────
// VISITANTES (público): estudiantes y usuarios normales
//   - Usuario normal: nombre + correo. Solo ve la info (sin bot).
//   - Estudiante: nombre + matrícula + correo institucional. Puede usar el bot.
//   - Verificación por código de 6 dígitos enviado al correo.
// ─────────────────────────────────────────────────────────────
const DOMINIO_ESTUDIANTE = process.env.DOMINIO_ESTUDIANTE || 'atlatlahucan.uaem.edu.mx';
const EMAIL_API_KEY = process.env.EMAIL_API_KEY || '';   // API key de Resend
const EMAIL_FROM    = process.env.EMAIL_FROM || 'UAEM Totolapan <onboarding@resend.dev>';
const CODIGO_VIGENCIA = 15 * 60 * 1000; // 15 minutos

let visitantes  = leerJSON('visitantes.json', []);
let sesionesVis = leerJSON('sesiones-visitantes.json', {});
let _seqVis = visitantes.reduce((m, v) => Math.max(m, v.id || 0), 0);
const guardarVisitantes  = () => guardarJSON('visitantes.json', visitantes);
const guardarSesionesVis = () => guardarJSON('sesiones-visitantes.json', sesionesVis);

const normCorreo = (c) => (c || '').toString().trim().toLowerCase();
const correoValido = (c) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c);
const esCorreoInstitucional = (c) =>
  new RegExp('^[^@\\s]+@' + DOMINIO_ESTUDIANTE.replace(/\./g, '\\.') + '$', 'i').test(c);
const nuevoCodigo = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');
const buscarVisitante = (correo) => visitantes.find(v => v.correo === normCorreo(correo));

async function enviarCodigo(correo, nombre, codigo) {
  const asunto = 'Tu código de acceso — UAEM Totolapan';
  const html = `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:480px;margin:auto">
    <h2 style="color:#003366">¡Hola ${nombre || ''}! 🦌</h2>
    <p>Tu código de acceso al Quiosco UAEM Totolapan es:</p>
    <div style="font-size:34px;font-weight:800;letter-spacing:8px;color:#003366;background:#eef2f8;padding:18px;text-align:center;border-radius:12px">${codigo}</div>
    <p style="color:#64748b;font-size:13px">Vence en 15 minutos. Si no lo solicitaste, ignora este correo.</p></div>`;
  if (!EMAIL_API_KEY) {
    console.log(`[email · MODO PRUEBA] Código para ${correo}: ${codigo}  (define EMAIL_API_KEY para enviar correos reales)`);
    return { dev: true };
  }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + EMAIL_API_KEY },
    body: JSON.stringify({ from: EMAIL_FROM, to: [correo], subject: asunto, html }),
  });
  if (!r.ok) throw new Error('No se pudo enviar el correo: ' + (await r.text().catch(() => '')).slice(0, 150));
  return { dev: false };
}

function visitanteDeReq(req) {
  const t = (req.headers['x-visitante'] || '').toString().trim();
  if (!t) return null;
  const s = sesionesVis[t];
  if (!s) return null;
  return buscarVisitante(s.correo) || null;
}

// ─────────────────────────────────────────────────────────────
// Utilidades HTTP
// ─────────────────────────────────────────────────────────────
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Token');
}
function sendJson(res, status, obj) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}
function servirArchivo(res, archivo, tipo) {
  try {
    const contenido = fs.readFileSync(path.join(__dirname, archivo));
    cors(res);
    res.writeHead(200, { 'Content-Type': tipo });
    res.end(contenido);
  } catch (e) {
    res.writeHead(404); res.end('No encontrado: ' + archivo);
  }
}

// Tipos MIME para servir la página (carpeta public/)
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.pdf': 'application/pdf',
};
// Sirve un archivo de public/ (protegido contra salir de la carpeta)
function servirEstatico(res, ruta) {
  let rel = decodeURIComponent(ruta.split('?')[0]).replace(/^\/+/, '');
  if (rel === '' ) rel = 'portada.html';
  const full = path.normalize(path.join(DIR_PUBLIC, rel));
  if (!full.startsWith(DIR_PUBLIC)) { res.writeHead(403); return res.end('Prohibido'); }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('No encontrado'); }
    cors(res);
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(full).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', c => { d += c; if (d.length > 5e6) { req.destroy(); reject(new Error('body grande')); } });
    req.on('end', () => resolve(d));
    req.on('error', reject);
  });
}
async function jsonBody(req) {
  try { return JSON.parse((await readBody(req)) || '{}'); } catch { return {}; }
}
const nombreSeguro = (s) => (s || '').replace(/[^a-zA-Z0-9._ -]/g, '').trim();

// ─────────────────────────────────────────────────────────────
// Servidor
// ─────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const ruta = url.pathname;
  const metodo = req.method;

  if (metodo === 'OPTIONS') { cors(res); res.writeHead(204); return res.end(); }

  // ── Estado / salud ──────────────────────────────────────────
  if (metodo === 'GET' && ruta === '/health') {
    return sendJson(res, 200, { ok: true, modelo: MODELO_ACTUAL, nube: USAR_NUBE,
      pendientes: pendientes.length, usuarios: usuarios.length });
  }

  // ── Panel administrativo ────────────────────────────────────
  if (metodo === 'GET' && (ruta === '/admin' || ruta === '/maestros' || ruta === '/admin/' || ruta === '/maestros/')) {
    return servirArchivo(res, 'admin.html', 'text/html; charset=utf-8');
  }

  // ── Página del quiosco (estático desde public/) ─────────────
  if (metodo === 'GET' && ruta === '/') {
    return servirEstatico(res, 'portada.html');
  }

  // ── CHATBOT (estudiantes verificados o personal del panel) ──
  if (metodo === 'POST' && ruta === '/api/chat') {
    const vis = visitanteDeReq(req);
    const staff = usuarioDeToken(tokenDeReq(req)); // admin/guardián: privilegios de alumno
    const esEstudiante = vis && vis.verificado && vis.tipo === 'estudiante';
    if (!esEstudiante && !staff) {
      return sendJson(res, 403, { found: false, error: 'Solo estudiantes verificados o el personal pueden usar el asistente.' });
    }
    const quien = esEstudiante
      ? { nombre: vis.nombre, correo: vis.correo, matricula: vis.matricula }
      : { nombre: staff.nombre, correo: '(personal)', matricula: null };
    let question = '', area = '';
    try {
      const b = await jsonBody(req);
      question = (b.question || '').toString().trim();
      area = (b.area || '').toString().trim();
      if (!question) return sendJson(res, 200, { found: false });

      console.log(`[chat] ${quien.correo} · area="${area || 'general'}" · q="${question.slice(0, 60)}"`);
      const answer = await askIA(question, area);
      if (pareceSinRespuesta(answer)) {
        registrarPendiente(area, question, answer, quien);
        return sendJson(res, 200, { found: false });
      }
      return sendJson(res, 200, { found: true, answer });
    } catch (err) {
      console.error('[chat error]', err.message);
      if (question) registrarPendiente(area, question, null, quien);
      return sendJson(res, 200, { found: false });
    }
  }

  // ── AUTENTICACIÓN ───────────────────────────────────────────
  if (metodo === 'POST' && ruta === '/api/login') {
    const { usuario, password } = await jsonBody(req);
    const r = login(usuario, password);
    if (!r) return sendJson(res, 401, { ok: false, error: 'Usuario o contraseña incorrectos' });
    return sendJson(res, 200, { ok: true, ...r, areas: AREAS });
  }
  if (metodo === 'POST' && ruta === '/api/logout') {
    cerrarSesion(tokenDeReq(req));
    return sendJson(res, 200, { ok: true });
  }

  // ── VISITANTES (público): registro, verificación y login ────
  if (metodo === 'POST' && ruta === '/api/visitante/registro') {
    const b = await jsonBody(req);
    const tipo = b.tipo === 'estudiante' ? 'estudiante' : 'normal';
    const nombre = (b.nombre || '').toString().trim();
    const correo = normCorreo(b.correo);
    const matricula = (b.matricula || '').toString().trim();
    if (nombre.length < 3) return sendJson(res, 400, { ok: false, error: 'Escribe tu nombre completo' });
    if (!correoValido(correo)) return sendJson(res, 400, { ok: false, error: 'El correo no es válido' });
    if (tipo === 'estudiante') {
      if (!matricula) return sendJson(res, 400, { ok: false, error: 'Escribe tu matrícula' });
      if (!esCorreoInstitucional(correo))
        return sendJson(res, 400, { ok: false, error: 'El correo de estudiante debe ser @' + DOMINIO_ESTUDIANTE });
    }
    let v = buscarVisitante(correo);
    if (v && v.verificado) return sendJson(res, 200, { ok: true, yaRegistrado: true, mensaje: 'Ese correo ya tiene cuenta. Inicia sesión.' });
    const codigo = nuevoCodigo();
    if (!v) {
      v = { id: ++_seqVis, tipo, nombre, correo, matricula: tipo === 'estudiante' ? matricula : null,
        verificado: false, codigo, codigoExpira: Date.now() + CODIGO_VIGENCIA, creado: new Date().toISOString() };
      visitantes.push(v);
    } else {
      v.tipo = tipo; v.nombre = nombre; v.matricula = tipo === 'estudiante' ? matricula : null;
      v.codigo = codigo; v.codigoExpira = Date.now() + CODIGO_VIGENCIA;
    }
    guardarVisitantes();
    try {
      const r = await enviarCodigo(correo, nombre, codigo);
      return sendJson(res, 200, { ok: true, mensaje: 'Te enviamos un código a tu correo.', dev: r.dev ? codigo : undefined });
    } catch (e) { return sendJson(res, 500, { ok: false, error: e.message }); }
  }
  if (metodo === 'POST' && ruta === '/api/visitante/login') {
    const b = await jsonBody(req);
    const correo = normCorreo(b.correo);
    const v = buscarVisitante(correo);
    if (!v) return sendJson(res, 404, { ok: false, error: 'Ese correo no está registrado. Regístrate primero.' });
    v.codigo = nuevoCodigo(); v.codigoExpira = Date.now() + CODIGO_VIGENCIA; guardarVisitantes();
    try {
      const r = await enviarCodigo(correo, v.nombre, v.codigo);
      return sendJson(res, 200, { ok: true, mensaje: 'Te enviamos un código a tu correo.', dev: r.dev ? v.codigo : undefined });
    } catch (e) { return sendJson(res, 500, { ok: false, error: e.message }); }
  }
  if (metodo === 'POST' && ruta === '/api/visitante/verificar') {
    const b = await jsonBody(req);
    const correo = normCorreo(b.correo);
    const codigo = (b.codigo || '').toString().trim();
    const v = buscarVisitante(correo);
    if (!v) return sendJson(res, 404, { ok: false, error: 'Correo no registrado' });
    if (!v.codigo || v.codigo !== codigo) return sendJson(res, 400, { ok: false, error: 'Código incorrecto' });
    if (Date.now() > v.codigoExpira) return sendJson(res, 400, { ok: false, error: 'El código venció, pide uno nuevo' });
    v.verificado = true; v.codigo = null; guardarVisitantes();
    const token = crypto.randomBytes(24).toString('hex');
    sesionesVis[token] = { correo: v.correo }; guardarSesionesVis();
    return sendJson(res, 200, { ok: true, token, visitante: { tipo: v.tipo, nombre: v.nombre, correo: v.correo } });
  }
  if (metodo === 'GET' && ruta === '/api/visitante/yo') {
    const v = visitanteDeReq(req);
    if (!v || !v.verificado) return sendJson(res, 401, { ok: false });
    return sendJson(res, 200, { ok: true, visitante: { tipo: v.tipo, nombre: v.nombre, correo: v.correo } });
  }
  if (metodo === 'POST' && ruta === '/api/visitante/logout') {
    const t = (req.headers['x-visitante'] || '').toString().trim();
    if (sesionesVis[t]) { delete sesionesVis[t]; guardarSesionesVis(); }
    return sendJson(res, 200, { ok: true });
  }

  // A partir de aquí TODO requiere sesión (de STAFF)
  const yo = usuarioDeToken(tokenDeReq(req));
  if (ruta.startsWith('/api/') && !yo) {
    return sendJson(res, 401, { ok: false, error: 'Sesión no válida. Inicia sesión de nuevo.' });
  }

  // Datos de mi sesión (para restaurar al recargar)
  if (metodo === 'GET' && ruta === '/api/yo') {
    return sendJson(res, 200, { ok: true, usuario: publico(yo), areas: AREAS });
  }

  // ── PREGUNTAS PENDIENTES ────────────────────────────────────
  if (metodo === 'GET' && ruta === '/api/pendientes') {
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const filtroArea = url.searchParams.get('area') || '';
    let lista = pendientes.filter(p => yo.rol === 'admin' || p.area === yo.area);
    if (filtroArea) lista = lista.filter(p => p.area === filtroArea);
    if (q) lista = lista.filter(p => p.pregunta.toLowerCase().includes(q));
    return sendJson(res, 200, { ok: true, pendientes: [...lista].reverse() });
  }
  if (metodo === 'POST' && ruta === '/api/pendientes/responder') {
    const { id, respuesta } = await jsonBody(req);
    const p = pendientes.find(x => x.id === Number(id));
    if (!p) return sendJson(res, 404, { ok: false, error: 'No existe' });
    if (!cubreArea(yo, p.area)) return sendJson(res, 403, { ok: false, error: 'No tienes permiso sobre esta área' });
    if (!respuesta || !respuesta.trim()) return sendJson(res, 400, { ok: false, error: 'Escribe una respuesta' });
    return sendJson(res, 200, responderPendiente(id, respuesta, yo.nombre));
  }
  if (metodo === 'DELETE' && ruta === '/api/pendientes') {
    const id = Number(url.searchParams.get('id'));
    const i = pendientes.findIndex(p => p.id === id);
    if (i >= 0 && cubreArea(yo, pendientes[i].area)) {
      pendientes.splice(i, 1); guardarJSON('pendientes.json', pendientes);
    }
    return sendJson(res, 200, { ok: true });
  }

  // ── RESPUESTAS GUARDADAS ────────────────────────────────────
  if (metodo === 'GET' && ruta === '/api/respuestas') {
    const q = (url.searchParams.get('q') || '').toLowerCase();
    let lista = respuestas.filter(r => yo.rol === 'admin' || r.area === yo.area);
    if (q) lista = lista.filter(r => r.pregunta.toLowerCase().includes(q) || (r.respuesta || '').toLowerCase().includes(q));
    return sendJson(res, 200, { ok: true, respuestas: [...lista].reverse() });
  }
  if (metodo === 'DELETE' && ruta === '/api/respuestas') {
    const id = Number(url.searchParams.get('id'));
    const i = respuestas.findIndex(r => r.id === id);
    if (i >= 0 && cubreArea(yo, respuestas[i].area)) {
      respuestas.splice(i, 1); guardarJSON('respuestas.json', respuestas);
    }
    return sendJson(res, 200, { ok: true });
  }

  // ── DOCUMENTACIÓN ───────────────────────────────────────────
  if (metodo === 'GET' && ruta === '/api/documentacion') {
    const visibles = AREAS.filter(a => yo.rol === 'admin' || yo.area === a.id);
    const data = visibles.map(a => ({
      area: a.id, label: a.label,
      archivos: archivosDoc(a.id).map(x => ({ nombre: x.nombre, tamano: x.tamano })),
    }));
    return sendJson(res, 200, { ok: true, documentacion: data });
  }
  if (metodo === 'POST' && ruta === '/api/documentacion/subir') {
    const { area, nombre, contenido } = await jsonBody(req);
    if (!ES_AREA(area) || !cubreArea(yo, area)) return sendJson(res, 403, { ok: false, error: 'Sin permiso sobre esa área' });
    let n = nombreSeguro(nombre);
    if (!n) return sendJson(res, 400, { ok: false, error: 'Nombre de archivo inválido' });
    if (!/\.(txt|md)$/i.test(n)) n += '.txt';
    try {
      fs.mkdirSync(path.join(DIR_DOC, area), { recursive: true });
      fs.writeFileSync(path.join(DIR_DOC, area, n), (contenido || '').toString(), 'utf8');
      return sendJson(res, 200, { ok: true, nombre: n });
    } catch (e) { return sendJson(res, 500, { ok: false, error: e.message }); }
  }
  if (metodo === 'GET' && ruta === '/api/documentacion/ver') {
    const area = url.searchParams.get('area'); const nombre = nombreSeguro(url.searchParams.get('nombre'));
    if (!cubreArea(yo, area)) return sendJson(res, 403, { ok: false, error: 'Sin permiso' });
    try {
      const c = fs.readFileSync(path.join(DIR_DOC, area, nombre), 'utf8');
      return sendJson(res, 200, { ok: true, contenido: c });
    } catch { return sendJson(res, 404, { ok: false, error: 'No existe' }); }
  }
  if (metodo === 'DELETE' && ruta === '/api/documentacion') {
    const area = url.searchParams.get('area'); const nombre = nombreSeguro(url.searchParams.get('nombre'));
    if (!cubreArea(yo, area)) return sendJson(res, 403, { ok: false, error: 'Sin permiso' });
    try { fs.unlinkSync(path.join(DIR_DOC, area, nombre)); } catch {}
    return sendJson(res, 200, { ok: true });
  }

  // ── USUARIOS (solo administrador) ───────────────────────────
  if (ruta.startsWith('/api/usuarios')) {
    if (yo.rol !== 'admin') return sendJson(res, 403, { ok: false, error: 'Solo el administrador' });

    if (metodo === 'GET' && ruta === '/api/usuarios') {
      return sendJson(res, 200, { ok: true, usuarios: usuarios.map(publico), areas: AREAS });
    }
    if (metodo === 'POST' && ruta === '/api/usuarios') {
      const { usuario, password, nombre, rol, area } = await jsonBody(req);
      if (!usuario || !usuario.trim()) return sendJson(res, 400, { ok: false, error: 'Falta el usuario' });
      if (!password || password.length < 6) return sendJson(res, 400, { ok: false, error: 'La contraseña debe tener 6+ caracteres' });
      if (!['admin', 'guardian'].includes(rol)) return sendJson(res, 400, { ok: false, error: 'Rol inválido' });
      if (rol === 'guardian' && !ES_AREA(area)) return sendJson(res, 400, { ok: false, error: 'Elige un área para el guardián' });
      if (usuarios.some(u => u.usuario.toLowerCase() === usuario.trim().toLowerCase()))
        return sendJson(res, 400, { ok: false, error: 'Ese usuario ya existe' });
      usuarios.push(crearUsuario({ usuario, password, nombre, rol, area }));
      guardarJSON('usuarios.json', usuarios);
      return sendJson(res, 200, { ok: true });
    }
    if (metodo === 'POST' && ruta === '/api/usuarios/password') {
      const { usuario, password } = await jsonBody(req);
      if (!password || password.length < 6) return sendJson(res, 400, { ok: false, error: 'La contraseña debe tener 6+ caracteres' });
      const u = usuarios.find(x => x.usuario === usuario);
      if (!u) return sendJson(res, 404, { ok: false, error: 'No existe' });
      u.salt = crypto.randomBytes(16).toString('hex');
      u.hash = hashPass(password, u.salt);
      guardarJSON('usuarios.json', usuarios);
      return sendJson(res, 200, { ok: true });
    }
    if (metodo === 'DELETE' && ruta === '/api/usuarios') {
      const usuario = url.searchParams.get('usuario');
      if (usuario === yo.usuario) return sendJson(res, 400, { ok: false, error: 'No puedes eliminarte a ti mismo' });
      usuarios = usuarios.filter(u => u.usuario !== usuario);
      guardarJSON('usuarios.json', usuarios);
      return sendJson(res, 200, { ok: true });
    }
  }

  // Cualquier otro GET: intenta servirlo como archivo de la página (public/)
  if (metodo === 'GET') return servirEstatico(res, ruta);

  sendJson(res, 404, { ok: false, error: 'Ruta no encontrada' });
});

server.listen(PORT, () => {
  console.log('──────────────────────────────────────────────');
  console.log('  Quiosco UAEM Totolapan — WEB');
  console.log(`  Página:          http://localhost:${PORT}/`);
  console.log(`  Panel maestros:  http://localhost:${PORT}/admin`);
  console.log(`  Motor de IA:     ${USAR_NUBE ? 'NUBE' : 'Ollama local'} · ${MODELO_ACTUAL}`);
  console.log(`  Usuarios: ${usuarios.length}   Pendientes: ${pendientes.length}   Respuestas: ${respuestas.length}`);
  console.log('──────────────────────────────────────────────');
});
