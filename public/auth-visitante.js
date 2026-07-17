/**
 * Control de acceso de VISITANTES para el sitio del Quiosco UAEM.
 * - Bloquea todo el sitio hasta iniciar sesión.
 * - Dos tipos: "estudiante" (correo @atlatlahucan.uaem.edu.mx + matrícula → puede
 *   usar el bot) y "visitante/usuario normal" (nombre + correo → solo ve la info).
 * - Verificación por código de 6 dígitos enviado al correo.
 * Debe incluirse en el <head> de cada página, antes de chatbot.js.
 */
(function () {
  var API = window.location.origin;
  var KEY = 'uaem_visitante_token';
  var DOMINIO = 'atlatlahucan.uaem.edu.mx';
  var token = localStorage.getItem(KEY) || '';
  var estado = { tipo: 'estudiante', correo: '', modo: 'registro' }; // modo: registro | login | codigo

  // ── Estilos + overlay ──
  var style = document.createElement('style');
  style.textContent = [
    '#uaemv{position:fixed;inset:0;z-index:2147483000;background:linear-gradient(135deg,#001a3d,#003366 60%,#00284d);',
    'display:flex;align-items:center;justify-content:center;padding:18px;font-family:"Segoe UI",system-ui,sans-serif;overflow:auto}',
    '#uaemv *{box-sizing:border-box}',
    '#uaemv .caja{background:#fff;border-radius:18px;padding:30px 28px;width:100%;max-width:410px;box-shadow:0 25px 60px rgba(0,0,0,.4)}',
    '#uaemv .venado{font-size:46px;text-align:center}',
    '#uaemv h2{margin:6px 0 2px;text-align:center;color:#003366;font-size:1.5rem}',
    '#uaemv .sub{text-align:center;color:#64748b;font-size:.85rem;margin:0 0 20px}',
    '#uaemv .tipos{display:flex;gap:10px;margin-bottom:18px}',
    '#uaemv .tipo{flex:1;border:2px solid #e2e8f0;border-radius:12px;padding:12px 8px;text-align:center;cursor:pointer;font-weight:700;color:#475569;font-size:.9rem}',
    '#uaemv .tipo.act{border-color:#1e90ff;background:#eff6ff;color:#0066cc}',
    '#uaemv label{display:block;font-size:.78rem;font-weight:600;color:#64748b;margin:12px 0 5px}',
    '#uaemv input{width:100%;padding:12px 14px;border:1px solid #cbd5e1;border-radius:10px;outline:none;font-size:.95rem}',
    '#uaemv input:focus{border-color:#1e90ff}',
    '#uaemv .btn{width:100%;margin-top:20px;padding:13px;border:none;border-radius:10px;background:linear-gradient(135deg,#1e90ff,#0066cc);color:#fff;font-weight:700;font-size:1rem;cursor:pointer}',
    '#uaemv .btn:disabled{opacity:.6;cursor:not-allowed}',
    '#uaemv .link{display:block;text-align:center;margin-top:16px;color:#0066cc;font-size:.85rem;cursor:pointer;background:none;border:none;width:100%}',
    '#uaemv .msg{margin-top:14px;font-size:.85rem;text-align:center;min-height:18px}',
    '#uaemv .msg.err{color:#c0392b}#uaemv .msg.ok{color:#2e7d32}',
    '#uaemv .codigo{letter-spacing:10px;text-align:center;font-size:1.6rem;font-weight:800}',
    '#uaemv .dev{margin-top:10px;background:#fff8e1;border:1px dashed #ffb300;border-radius:8px;padding:8px;font-size:.8rem;color:#8a6d00;text-align:center}',
    '#uaemv-badge{position:fixed;bottom:12px;left:12px;z-index:2147482000;background:rgba(0,20,45,.82);color:#fff;',
    'border-radius:20px;padding:7px 14px;font:600 12px "Segoe UI",sans-serif;display:flex;gap:10px;align-items:center}',
    '#uaemv-badge button{background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:12px;padding:3px 10px;cursor:pointer;font-weight:700}'
  ].join('');
  (document.head || document.documentElement).appendChild(style);

  var ov = document.createElement('div');
  ov.id = 'uaemv';
  ov.innerHTML = '<div class="caja"><div class="venado">🦌</div><div class="sub">Cargando…</div></div>';
  (document.body || document.documentElement).appendChild(ov);

  function api(ruta, body) {
    return fetch(API + ruta, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', 'X-Visitante': token },
      body: body ? JSON.stringify(body) : undefined,
    }).then(function (r) { return r.json().catch(function () { return {}; }); });
  }
  var esc = function (s) { return (s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // ── Éxito: guardar sesión, revelar el sitio ──
  function entrar(visitante) {
    localStorage.setItem(KEY, token);
    window.UAEM_VISITANTE = Object.assign({ token: token }, visitante);
    ov.remove();
    mostrarBadge(visitante);
    window.dispatchEvent(new CustomEvent('uaem-visitante', { detail: visitante }));
  }
  function mostrarBadge(v) {
    var b = document.getElementById('uaemv-badge');
    if (b) b.remove();
    b = document.createElement('div');
    b.id = 'uaemv-badge';
    b.innerHTML = (v.tipo === 'estudiante' ? '🎓 ' : '👤 ') + esc(v.nombre.split(' ')[0]) +
      ' <button id="uaemv-salir">Salir</button>';
    document.body.appendChild(b);
    document.getElementById('uaemv-salir').onclick = salir;
  }
  function salir() {
    api('/api/visitante/logout', {});
    localStorage.removeItem(KEY); token = '';
    window.location.reload();
  }

  // ── Pantallas ──
  function pintarRegistro() {
    estado.modo = 'registro';
    ov.innerHTML =
      '<div class="caja"><div class="venado">🦌</div><h2>Bienvenido</h2>' +
      '<p class="sub">Regístrate para entrar a la información de la subsede</p>' +
      '<div class="tipos"><div class="tipo" data-t="estudiante">🎓 Estudiante</div>' +
      '<div class="tipo" data-t="normal">👤 Visitante</div></div>' +
      '<label>Nombre completo</label><input id="v-nombre" placeholder="Ej. Jhonatan Nava">' +
      '<div id="v-mat-wrap"><label>Matrícula</label><input id="v-mat" placeholder="Tu matrícula"></div>' +
      '<label>Correo electrónico</label><input id="v-correo" type="email" placeholder="">' +
      '<button class="btn" id="v-continuar">Continuar</button>' +
      '<button class="link" id="v-ir-login">Ya tengo cuenta · Iniciar sesión</button>' +
      '<div class="msg" id="v-msg"></div></div>';
    ov.querySelectorAll('.tipo').forEach(function (el) {
      el.onclick = function () { estado.tipo = el.dataset.t; aplicarTipo(); };
    });
    document.getElementById('v-continuar').onclick = registrar;
    document.getElementById('v-ir-login').onclick = pintarLogin;
    aplicarTipo();
  }
  function aplicarTipo() {
    ov.querySelectorAll('.tipo').forEach(function (el) { el.classList.toggle('act', el.dataset.t === estado.tipo); });
    var esEst = estado.tipo === 'estudiante';
    document.getElementById('v-mat-wrap').style.display = esEst ? 'block' : 'none';
    document.getElementById('v-correo').placeholder = esEst ? ('nombre.apellido@' + DOMINIO) : 'tucorreo@ejemplo.com';
  }
  function pintarLogin() {
    estado.modo = 'login';
    ov.innerHTML =
      '<div class="caja"><div class="venado">🦌</div><h2>Iniciar sesión</h2>' +
      '<p class="sub">Te enviaremos un código a tu correo</p>' +
      '<label>Correo electrónico</label><input id="v-correo" type="email" placeholder="tucorreo@ejemplo.com">' +
      '<button class="btn" id="v-enviar">Enviar código</button>' +
      '<button class="link" id="v-ir-reg">No tengo cuenta · Registrarme</button>' +
      '<div class="msg" id="v-msg"></div></div>';
    document.getElementById('v-enviar').onclick = loginCorreo;
    document.getElementById('v-ir-reg').onclick = pintarRegistro;
  }
  function pintarCodigo(dev) {
    estado.modo = 'codigo';
    ov.innerHTML =
      '<div class="caja"><div class="venado">📧</div><h2>Revisa tu correo</h2>' +
      '<p class="sub">Escribe el código que enviamos a<br><b>' + esc(estado.correo) + '</b></p>' +
      '<input id="v-codigo" class="codigo" maxlength="6" inputmode="numeric" placeholder="••••••">' +
      '<button class="btn" id="v-verificar">Verificar y entrar</button>' +
      '<button class="link" id="v-volver">← Volver</button>' +
      (dev ? '<div class="dev">Modo prueba (sin correo real). Tu código es: <b>' + esc(dev) + '</b></div>' : '') +
      '<div class="msg" id="v-msg"></div></div>';
    document.getElementById('v-verificar').onclick = verificar;
    document.getElementById('v-volver').onclick = pintarRegistro;
    setTimeout(function () { document.getElementById('v-codigo').focus(); }, 60);
  }
  function msg(t, ok) { var m = document.getElementById('v-msg'); if (m) { m.textContent = t; m.className = 'msg ' + (ok ? 'ok' : 'err'); } }

  function registrar() {
    var nombre = document.getElementById('v-nombre').value.trim();
    var correo = document.getElementById('v-correo').value.trim();
    var matricula = estado.tipo === 'estudiante' ? document.getElementById('v-mat').value.trim() : '';
    if (nombre.length < 3) return msg('Escribe tu nombre completo');
    if (estado.tipo === 'estudiante' && !matricula) return msg('Escribe tu matrícula');
    var btn = document.getElementById('v-continuar'); btn.disabled = true; msg('Enviando…', true);
    api('/api/visitante/registro', { tipo: estado.tipo, nombre: nombre, correo: correo, matricula: matricula })
      .then(function (j) {
        btn.disabled = false;
        if (j.yaRegistrado) { estado.correo = correo; return pintarLogin(); }
        if (!j.ok) return msg(j.error || 'No se pudo registrar');
        estado.correo = correo; pintarCodigo(j.dev);
      }).catch(function () { btn.disabled = false; msg('Error de conexión'); });
  }
  function loginCorreo() {
    var correo = document.getElementById('v-correo').value.trim();
    var btn = document.getElementById('v-enviar'); btn.disabled = true; msg('Enviando…', true);
    api('/api/visitante/login', { correo: correo }).then(function (j) {
      btn.disabled = false;
      if (!j.ok) return msg(j.error || 'No se pudo enviar');
      estado.correo = correo; pintarCodigo(j.dev);
    }).catch(function () { btn.disabled = false; msg('Error de conexión'); });
  }
  function verificar() {
    var codigo = document.getElementById('v-codigo').value.trim();
    if (!/^\d{6}$/.test(codigo)) return msg('El código son 6 dígitos');
    var btn = document.getElementById('v-verificar'); btn.disabled = true; msg('Verificando…', true);
    api('/api/visitante/verificar', { correo: estado.correo, codigo: codigo }).then(function (j) {
      btn.disabled = false;
      if (!j.ok || !j.token) return msg(j.error || 'Código incorrecto');
      token = j.token; entrar(j.visitante);
    }).catch(function () { btn.disabled = false; msg('Error de conexión'); });
  }

  // ── Arranque: ¿ya hay sesión válida? ──
  if (token) {
    api('/api/visitante/yo').then(function (j) {
      if (j.ok) entrar(j.visitante); else pintarRegistro();
    }).catch(pintarRegistro);
  } else {
    pintarRegistro();
  }
})();
