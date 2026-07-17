/**
 * Siembra la carpeta server/documentacion/<área>/ con el texto extraído de las
 * páginas HTML del quiosco (planes de estudio, trámites, becas, etc.).
 * Así el bot tiene información oficial desde el primer arranque y la pestaña
 * "Documentación" del panel no aparece vacía.
 *
 * Ejecuta:  node construir-conocimiento.js   (o: npm run conocimiento)
 * No sobreescribe archivos que ya edites a mano salvo que uses --force.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'public');          // páginas de la web
const DOC = path.join(__dirname, 'documentacion');
const FORCE = process.argv.includes('--force');

// Página HTML  →  { área del panel, nombre del archivo de documentación }
// Cada carrera es su propia área. "general" es el buzón de preguntas sin área
// específica (lo usa el bot para la oferta general; lo ve el administrador).
const MAPA = [
  { html: 'informaticaprograma.html',    area: 'informatica',         archivo: 'plan.txt' },
  { html: 'derechoprograma.html',        area: 'derecho',             archivo: 'plan.txt' },
  { html: 'administracionprograma.html', area: 'administracion',      archivo: 'plan.txt' },
  { html: 'contadorprograma.html',       area: 'contador-publico',    archivo: 'plan.txt' },
  { html: 'servicios.html',              area: 'servicios-escolares', archivo: 'tramites.txt' },
  { html: 'titulaciones.html',           area: 'titulaciones',        archivo: 'info.txt' },
  { html: 'becas.html',                  area: 'becas',               archivo: 'info.txt' },
  { html: 'programas.html',              area: 'general',             archivo: 'oferta.txt' },
];

const ENTIDADES = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&aacute;': 'á', '&eacute;': 'é', '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú',
  '&ntilde;': 'ñ', '&Aacute;': 'Á', '&Eacute;': 'É', '&Iacute;': 'Í', '&Oacute;': 'Ó',
  '&Uacute;': 'Ú', '&Ntilde;': 'Ñ', '&uuml;': 'ü', '&deg;': '°', '&mdash;': '—', '&ndash;': '–',
};
function decodificar(t) {
  t = t.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)));
  for (const [k, v] of Object.entries(ENTIDADES)) t = t.split(k).join(v);
  return t;
}
function htmlATexto(html) {
  let t = html;
  t = t.replace(/<script[\s\S]*?<\/script>/gi, ' ')
       .replace(/<style[\s\S]*?<\/style>/gi, ' ')
       .replace(/<!--[\s\S]*?-->/g, ' ')
       .replace(/<\/(p|li|tr|h[1-6]|div|section|article|header|footer)>/gi, '\n')
       .replace(/<br\s*\/?>/gi, '\n')
       .replace(/<\/td>/gi, ' | ')
       .replace(/<[^>]+>/g, ' ');
  t = decodificar(t).replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n');
  const RUIDO = new Set(['arrow_back', 'REGRESAR', 'menu', 'close', 'home']);
  const esIcono = (l) => /^[a-z][a-z0-9_]*$/.test(l) && (l.includes('_') || l.length <= 4);
  return t.split('\n').map(l => l.trim())
    .filter(l => l && l.length > 1 && !RUIDO.has(l) && !esIcono(l))
    .join('\n').trim();
}

function main() {
  let ok = 0, saltados = 0;
  for (const { html, area, archivo } of MAPA) {
    const ruta = path.join(ROOT, html);
    if (!fs.existsSync(ruta)) { console.warn(`  ! No existe ${html} — se omite`); continue; }
    const destinoDir = path.join(DOC, area);
    fs.mkdirSync(destinoDir, { recursive: true });
    const destino = path.join(destinoDir, archivo);
    if (fs.existsSync(destino) && !FORCE) {
      console.log(`  · ${area}/${archivo} ya existe (usa --force para regenerar)`);
      saltados++; continue;
    }
    const texto = htmlATexto(fs.readFileSync(ruta, 'utf8'));
    fs.writeFileSync(destino, texto, 'utf8');
    console.log(`  ✓ ${area}/${archivo}  (${texto.length.toLocaleString()} caracteres)`);
    ok++;
  }
  console.log(`\nListo: ${ok} generado(s), ${saltados} conservado(s). Carpeta: ${DOC}`);
}
main();
