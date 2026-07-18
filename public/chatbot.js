
(function () {
  // El asistente existe para estudiantes verificados y para el personal (admin).
  // Se inicia cuando auth-visitante.js confirma la sesión (evento 'uaem-visitante').
  function puedeUsarBot() {
    var v = window.UAEM_VISITANTE;
    return !!(v && (v.tipo === 'estudiante' || v.tipo === 'staff'));
  }
  function iniciarChatbot() {
  if (window.__UAEM_CHATBOT_LOADED__) return;
  if (!puedeUsarBot()) return;
  window.__UAEM_CHATBOT_LOADED__ = true;

  const SERVER_URL = (window.UAEM_CONFIG && window.UAEM_CONFIG.SERVER_URL) || window.location.origin;
  const PAGE_AREA = window.UAEM_PAGE_AREA || (window.UAEM_CONFIG && window.UAEM_CONFIG.DEFAULT_AREA) || null;

  //Estilos
  const css = `
  #uaem-chatbot-root, #uaem-chatbot-root * { box-sizing: border-box; font-family: 'Montserrat', system-ui, sans-serif; }
  #uaem-chatbot-launcher {
    position: fixed; bottom: 24px; right: 24px; z-index: 99999;
    width: 86px; height: 86px; border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #f5d089 0%, #c89968 55%, #8b6235 100%);
    box-shadow: 0 12px 35px rgba(0,0,0,0.35), 0 0 0 4px rgba(255,255,255,0.12);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: transform .2s;
    animation: uaem-pulse 3s ease-in-out infinite;
  }
  #uaem-chatbot-launcher:hover { transform: scale(1.08); }
  #uaem-chatbot-launcher .deer-svg {
    width: 64px; height: 64px;
    animation: uaem-deer-bob 2.6s ease-in-out infinite;
    transform-origin: center;
  }
  #uaem-chatbot-launcher .badge {
    position: absolute; top: -4px; right: -4px;
    background: #ff5252; color: #fff; font-size: 11px; font-weight: 700;
    border-radius: 50%; min-width: 22px; height: 22px;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #fff;
  }
  #uaem-chatbot-bubble {
    position: fixed; bottom: 120px; right: 24px; z-index: 99999;
    background: #fff; color: #1a2638; padding: 10px 16px;
    border-radius: 18px 18px 4px 18px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    font-size: 14px; font-weight: 600; max-width: 240px;
    animation: uaem-bubble-in .4s ease both;
  }
  #uaem-chatbot-bubble::after {
    content: ''; position: absolute; bottom: -8px; right: 26px;
    border-left: 10px solid transparent; border-right: 10px solid transparent;
    border-top: 10px solid #fff;
  }
  @keyframes uaem-bubble-in {
    from { opacity: 0; transform: translateY(10px) scale(.9); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes uaem-pulse {
    0%, 100% { box-shadow: 0 12px 35px rgba(0,0,0,0.35), 0 0 0 0 rgba(200,153,104,0.7); }
    50%      { box-shadow: 0 12px 35px rgba(0,0,0,0.35), 0 0 0 18px rgba(200,153,104,0); }
  }
  @keyframes uaem-deer-bob {
    0%, 100% { transform: translateY(0) rotate(-3deg); }
    50%      { transform: translateY(-5px) rotate(3deg); }
  }
  @keyframes uaem-deer-blink {
    0%, 95%, 100% { transform: scaleY(1); }
    97%           { transform: scaleY(0.1); }
  }
  .deer-eye { transform-origin: center; animation: uaem-deer-blink 4s infinite; }

  #uaem-chatbot-panel {
    position: fixed; bottom: 24px; right: 24px; z-index: 99999;
    width: 380px; height: 560px; max-height: 80vh;
    background: #fff; border-radius: 20px;
    box-shadow: 0 25px 60px rgba(0,0,0,0.35);
    display: none; flex-direction: column; overflow: hidden;
  }
  #uaem-chatbot-panel.open { display: flex; animation: uaem-panel-in .25s ease both; }
  @keyframes uaem-panel-in {
    from { opacity: 0; transform: translateY(20px) scale(.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  #uaem-chatbot-header {
    background: linear-gradient(135deg, #001433 0%, #003366 60%, #005599 100%);
    color: #fff; padding: 16px 18px; display: flex; align-items: center; gap: 12px;
  }
  #uaem-chatbot-header .title { font-weight: 700; font-size: 1rem; }
  #uaem-chatbot-header .subtitle { font-size: 0.72rem; color: #9bb6d4; }
  #uaem-chatbot-header svg { width: 44px; height: 44px; animation: uaem-deer-bob 2.6s ease-in-out infinite; }
  #uaem-chatbot-header .close-btn {
    margin-left: auto; background: rgba(255,255,255,0.15); border: none;
    color: #fff; width: 32px; height: 32px; border-radius: 50%;
    font-size: 18px; cursor: pointer; transition: background .15s;
  }
  #uaem-chatbot-header .close-btn:hover { background: rgba(255,255,255,0.28); }

  #uaem-chatbot-messages {
    flex: 1; padding: 16px; overflow-y: auto;
    background: linear-gradient(180deg, #f3f6fc 0%, #e8eef8 100%);
    display: flex; flex-direction: column; gap: 10px;
  }
  .msg { max-width: 84%; padding: 10px 14px; border-radius: 14px; font-size: 0.92rem; line-height: 1.4; white-space: pre-wrap; }
  .msg.bot { background: #fff; color: #1a2638; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .msg.user { background: linear-gradient(135deg, #1e90ff, #0066cc); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
  .msg.system { background: #fef3c7; color: #92400e; align-self: center; font-size: 0.82rem; text-align: center; padding: 6px 12px; border-radius: 10px; }

  .typing { display: flex; gap: 4px; padding: 12px 14px; }
  .typing span { width: 8px; height: 8px; background: #94a3b8; border-radius: 50%; animation: uaem-typing 1.2s infinite; }
  .typing span:nth-child(2) { animation-delay: .15s; }
  .typing span:nth-child(3) { animation-delay: .3s; }
  @keyframes uaem-typing {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30%           { transform: translateY(-6px); opacity: 1; }
  }

  #uaem-chatbot-areas { display: flex; gap: 6px; padding: 8px 12px; background: #fff; border-top: 1px solid #e2e8f0; flex-wrap: wrap; }
  #uaem-chatbot-areas button {
    background: #eef2ff; color: #4338ca; border: none;
    padding: 6px 12px; border-radius: 14px; cursor: pointer; font-size: 0.75rem; font-weight: 600;
  }
  #uaem-chatbot-areas button.active { background: #4338ca; color: #fff; }

  #uaem-chatbot-carreras {
    display: none; gap: 6px; padding: 0 12px 8px; background: #fff; flex-wrap: wrap;
    border-bottom: 1px solid #e2e8f0;
  }
  #uaem-chatbot-carreras.open { display: flex; }
  #uaem-chatbot-carreras .carreras-title {
    width: 100%; font-size: 0.7rem; font-weight: 700; color: #64748b; margin-bottom: 2px;
  }
  #uaem-chatbot-carreras button {
    background: #fef3c7; color: #92400e; border: none;
    padding: 6px 12px; border-radius: 14px; cursor: pointer; font-size: 0.75rem; font-weight: 600;
  }
  #uaem-chatbot-carreras button.active { background: #c89968; color: #fff; }

  #uaem-chatbot-input-bar {
    padding: 12px; background: #fff; border-top: 1px solid #e2e8f0; display: flex; gap: 8px;
  }
  #uaem-chatbot-input {
    flex: 1; padding: 11px 14px; border: 1px solid #cbd5e1; border-radius: 22px;
    font-size: 0.92rem; outline: none; transition: border .2s;
  }
  #uaem-chatbot-input:focus { border-color: #1e90ff; }
  #uaem-chatbot-send {
    background: linear-gradient(135deg, #1e90ff, #0066cc); color: #fff;
    border: none; padding: 0 18px; border-radius: 22px; cursor: pointer;
    font-weight: 700; font-size: 0.9rem;
  }
  #uaem-chatbot-send:disabled { opacity: 0.5; cursor: not-allowed; }

  @media (max-width: 480px) {
    #uaem-chatbot-panel { right: 8px; left: 8px; width: auto; bottom: 100px; }
  }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  //SVG del venado
  const deerSVG = `
    <svg class="deer-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Astas -->
      <path d="M30 25 L20 5 M30 25 L15 15 M30 25 L25 10
               M70 25 L80 5 M70 25 L85 15 M70 25 L75 10"
            stroke="#5a3a1b" stroke-width="3" stroke-linecap="round" fill="none"/>
      <!-- Orejas -->
      <ellipse cx="28" cy="35" rx="7" ry="11" fill="#8b6235" transform="rotate(-20 28 35)"/>
      <ellipse cx="72" cy="35" rx="7" ry="11" fill="#8b6235" transform="rotate(20 72 35)"/>
      <!-- Cabeza -->
      <ellipse cx="50" cy="52" rx="28" ry="32" fill="#a37047"/>
      <!-- Hocico -->
      <ellipse cx="50" cy="70" rx="14" ry="13" fill="#e7c596"/>
      <!-- Ojos -->
      <g class="deer-eye"><circle cx="40" cy="50" r="4" fill="#fff"/><circle cx="40" cy="51" r="2.2" fill="#1a1a1a"/></g>
      <g class="deer-eye"><circle cx="60" cy="50" r="4" fill="#fff"/><circle cx="60" cy="51" r="2.2" fill="#1a1a1a"/></g>
      <!-- Brillo en ojos -->
      <circle cx="41" cy="50.2" r="0.6" fill="#fff"/>
      <circle cx="61" cy="50.2" r="0.6" fill="#fff"/>
      <!-- Nariz -->
      <ellipse cx="50" cy="67" rx="3.5" ry="2.5" fill="#3a2818"/>
      <!-- Sonrisa -->
      <path d="M44 75 Q50 79 56 75" stroke="#3a2818" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <!-- Manchas blancas decorativas -->
      <circle cx="32" cy="60" r="2" fill="#fff" opacity="0.6"/>
      <circle cx="68" cy="60" r="2" fill="#fff" opacity="0.6"/>
    </svg>
  `;

  //DOM 
  const root = document.createElement('div');
  root.id = 'uaem-chatbot-root';
  root.innerHTML = `
    <div id="uaem-chatbot-bubble">¡Hola! Soy <b>Venado</b>, pregúntame lo que necesites 🦌</div>
    <div id="uaem-chatbot-launcher" title="Pregúntale al Venado UAEM">
      ${deerSVG}
    </div>
    <div id="uaem-chatbot-panel" role="dialog" aria-label="Chatbot UAEM">
      <div id="uaem-chatbot-header">
        ${deerSVG}
        <div>
          <div class="title">Venado UAEM</div>
          <div class="subtitle">Asistente de la subsede Totolapan</div>
        </div>
        <button class="close-btn" aria-label="Cerrar">×</button>
      </div>
      <div id="uaem-chatbot-messages"></div>
      <div id="uaem-chatbot-areas">
        <button data-area="">General</button>
        <button data-area="titulaciones">Titulaciones</button>
        <button data-area="servicios-escolares">Servicios Escolares</button>
        <button data-area="becas">Becas, Servicio, Prácticas y Seguro</button>
        <button data-area="programa-educativo" data-toggle-carreras="1">Programas educativos ▾</button>
      </div>
      <div id="uaem-chatbot-carreras">
        <span class="carreras-title">Elige tu carrera:</span>
        <button data-area="informatica">Informática</button>
        <button data-area="derecho">Derecho</button>
        <button data-area="contador-publico">Contador Público</button>
        <button data-area="administracion">Administración</button>
      </div>
      <form id="uaem-chatbot-input-bar">
        <input id="uaem-chatbot-input" type="text" placeholder="Escribe tu pregunta…" autocomplete="off" />
        <button id="uaem-chatbot-send" type="submit">Enviar</button>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  //Comportamiento
  const launcher = root.querySelector('#uaem-chatbot-launcher');
  const bubble = root.querySelector('#uaem-chatbot-bubble');
  const panel = root.querySelector('#uaem-chatbot-panel');
  const closeBtn = root.querySelector('.close-btn');
  const messages = root.querySelector('#uaem-chatbot-messages');
  const input = root.querySelector('#uaem-chatbot-input');
  const sendBtn = root.querySelector('#uaem-chatbot-send');
  const form = root.querySelector('#uaem-chatbot-input-bar');
  const areaButtons = root.querySelectorAll('#uaem-chatbot-areas button');
  const carrerasRow = root.querySelector('#uaem-chatbot-carreras');
  const carreraButtons = root.querySelectorAll('#uaem-chatbot-carreras button');

  const CARRERA_LABEL = {
    'informatica': 'Lic. en Informática',
    'derecho': 'Lic. en Derecho',
    'contador-publico': 'Lic. en Contador Público',
    'administracion': 'Lic. en Administración',
  };

  let currentArea = PAGE_AREA || '';
  if (currentArea) {
    areaButtons.forEach(b => b.classList.toggle('active', b.dataset.area === currentArea));
  } else {
    areaButtons[0].classList.add('active');
  }

  function clearActive() {
    areaButtons.forEach(b => b.classList.remove('active'));
    carreraButtons.forEach(b => b.classList.remove('active'));
  }

  areaButtons.forEach(btn => {
    btn.onclick = () => {
      // "Programas educativos" despliega las 4 carreras
      if (btn.dataset.toggleCarreras) {
        const willOpen = !carrerasRow.classList.contains('open');
        carrerasRow.classList.toggle('open', willOpen);
        clearActive();
        btn.classList.add('active');
        currentArea = btn.dataset.area; // programa-educativo (general)
        return;
      }
      // Cualquier otra área cierra el submenú de carreras
      carrerasRow.classList.remove('open');
      clearActive();
      btn.classList.add('active');
      currentArea = btn.dataset.area;
    };
  });

  carreraButtons.forEach(btn => {
    btn.onclick = () => {
      clearActive();
      // mantener resaltado "Programas educativos" + la carrera elegida
      root.querySelector('#uaem-chatbot-areas button[data-toggle-carreras]').classList.add('active');
      btn.classList.add('active');
      currentArea = btn.dataset.area;
      addBot('Has elegido ' + (CARRERA_LABEL[currentArea] || 'esta carrera') +
        '. Pregúntame lo que quieras sobre su plan de estudios: materias por semestre, créditos, perfil de egreso, campo laboral, requisitos de ingreso, etc.');
    };
  });

  function open() {
    panel.classList.add('open');
    bubble.style.display = 'none';
    launcher.style.display = 'none';
    setTimeout(() => input.focus(), 100);
    if (!messages.children.length) {
      addBot('¡Hola! Soy Beni, asistente de la UAEM Subsede Totolapan. ¿En qué puedo ayudarte? Puedes elegir un área o simplemente escribir tu duda.');
    }
  }
  function close() {
    panel.classList.remove('open');
    bubble.style.display = 'block';
    launcher.style.display = 'flex';
  }
  launcher.onclick = open;
  closeBtn.onclick = close;

  //Auto-ocultar la burbuja después de 8s
  setTimeout(() => { bubble.style.transition = 'opacity .6s'; bubble.style.opacity = '0'; setTimeout(() => bubble.style.display = 'none', 600); }, 8000);

  function addMsg(text, who) {
    const el = document.createElement('div');
    el.className = 'msg ' + who;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }
  function addBot(text) { return addMsg(text, 'bot'); }
  function addUser(text) { return addMsg(text, 'user'); }
  function addSystem(text) { return addMsg(text, 'system'); }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'msg bot typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  async function ask(question) {
    addUser(question);
    const typing = showTyping();
    sendBtn.disabled = true;
    try {
      const res = await fetch(SERVER_URL + '/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Estudiante → X-Visitante; personal/admin → Authorization. El servidor
          // acepta el que corresponda; mandamos el mismo token en ambos.
          'X-Visitante': (window.UAEM_VISITANTE && window.UAEM_VISITANTE.token) || '',
          'Authorization': 'Bearer ' + ((window.UAEM_VISITANTE && window.UAEM_VISITANTE.token) || ''),
        },
        body: JSON.stringify({ question, area: currentArea || undefined }),
      });
      const data = await res.json();
      typing.remove();
      if (data.found) {
        addBot(data.answer);
      } else {
        addBot('🦌 No tengo esa información todavía, pero envié tu pregunta a un Guardián UAEM. Vuelve a preguntarme más tarde y podré responderte.');
        addSystem('Pregunta enviada para revisión humana');
      }
    } catch (e) {
      typing.remove();
      addBot('No pude contactar al servidor. Verifica tu conexión o inténtalo más tarde.');
      console.error(e);
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    ask(q);
  });
  } // fin de iniciarChatbot()

  iniciarChatbot();
  window.addEventListener('uaem-visitante', iniciarChatbot);
})();
