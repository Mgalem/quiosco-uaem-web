/**
 * Configuración global del Quiosco UAEM.
 *
 * La dirección del servidor se toma, en este orden:
 *   1) El archivo "quiosco-config.json" junto al .exe (lo lee preload.js).
 *      → Edita ESE archivo en cada kiosco para apuntar al servidor central.
 *   2) Si no existe, usa el valor de abajo (http://localhost:3001).
 *
 * Ejemplos de SERVER_URL:
 *   - Mismo equipo:    http://localhost:3001
 *   - Red local (LAN): http://192.168.1.143:3001
 */
window.UAEM_CONFIG = {
  // 1) Si la app es Electron (.exe), usa lo que leyó del quiosco-config.json.
  // 2) Si se abre por NAVEGADOR (http/https), usa el mismo servidor que sirvió
  //    la página (location.origin) — así no hay que configurar nada.
  // 3) Último recurso: localhost.
  SERVER_URL: (window.UAEM_BOOT && window.UAEM_BOOT.serverUrl)
    || ((location.protocol === 'http:' || location.protocol === 'https:') ? location.origin : 'http://192.168.1.74:3001'),

  // Área por defecto sugerida al chatbot cuando la página no la indica.
  // Cada página del kiosco puede sobreescribir esto antes de cargar chatbot.js
  // con: window.UAEM_PAGE_AREA = 'titulaciones';
  DEFAULT_AREA: null,
};
