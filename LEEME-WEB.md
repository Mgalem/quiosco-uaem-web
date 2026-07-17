# Quiosco UAEM — versión WEB

Todo el proyecto convertido a página web. **Un solo servidor Node** sirve:

- **La página** (portada, menú, carreras, becas…) → `public/`
- **El bot** → `POST /api/chat`
- **El panel de maestros** → `/admin`

No usa dependencias de npm (Node puro), así que es fácil de subir a cualquier lado.

## Probar en tu PC

```bash
node server.js
# Página:  http://localhost:3001/
# Panel:   http://localhost:3001/admin   (admin / admin123)
```

Si editas el contenido de las páginas: `node construir-conocimiento.js` (regenera lo que sabe el bot).

---

## Login de visitantes (estudiantes y usuarios)

La página está **protegida por login**: nadie ve el sitio sin registrarse.

- **Usuario normal** (visitante): nombre completo + correo. **Solo ve la información**, no el bot.
- **Estudiante**: nombre completo + matrícula + correo institucional
  **`@atlatlahucan.uaem.edu.mx`** (se valida el dominio). **Solo los estudiantes usan el bot.**
- **Verificación por correo**: al registrarse/iniciar sesión se envía un **código de 6 dígitos**
  al correo; hay que escribirlo para entrar.

### Enviar los correos de verificación (Resend)

1. Crea una cuenta gratis en **https://resend.com** y genera una **API key**.
2. Define estas variables de entorno en tu host:

| Variable | Valor |
|----------|-------|
| `EMAIL_API_KEY` | tu API key de Resend |
| `EMAIL_FROM` | remitente, ej. `UAEM Totolapan <no-reply@tudominio.com>` |
| `DOMINIO_ESTUDIANTE` | (opcional) por defecto `atlatlahucan.uaem.edu.mx` |

> Para enviar a cualquier correo real necesitas **verificar tu dominio** en Resend.
> Mientras tanto (o para pruebas), si NO defines `EMAIL_API_KEY`, el sistema funciona en
> **modo prueba**: muestra el código en la propia pantalla y en la consola del servidor.

Los visitantes se guardan en `datos/visitantes.json`.

## El punto importante para el HOSTING: la IA

El bot necesita un modelo de lenguaje. Hay **dos formas**, y de eso depende qué host te sirve:

### Opción A — IA en la nube (RECOMENDADA para web) ✅

En vez de Ollama, el servidor usa una **API de IA en la nube** (compatible con OpenAI).
Así **cualquier hosting barato de Node funciona** (no necesitas un servidor potente).

Solo defines variables de entorno en el host:

| Variable | Valor |
|----------|-------|
| `LLM_API_KEY` | tu API key (ej. de **Groq**, tiene capa gratuita) |
| `LLM_BASE_URL` | `https://api.groq.com/openai/v1` (ya es el valor por defecto) |
| `LLM_MODEL` | `llama-3.1-8b-instant` (rápido y gratis en Groq) |

En cuanto pongas `LLM_API_KEY`, el servidor usa la nube automáticamente (ya no toca Ollama).

**Hosts recomendados con esta opción:**
- **Render.com** — plan gratuito para probar (se "duerme" tras inactividad); ~$7/mes para que esté siempre encendido. Deploy de Node en 2 clics.
- **Railway.app** — ~$5/mes, muy fácil.
- **Fly.io** — tiene capa gratuita.
- Cualquier VPS pequeño ($4–6/mes) también sirve.

> Groq: crea tu cuenta gratis en https://console.groq.com , genera una API key y pégala en `LLM_API_KEY`. Es rápido y su capa gratuita alcanza de sobra para un quiosco.

### Opción B — IA propia con Ollama (100% tuyo, sin depender de nadie)

Si quieres seguir con Ollama (offline/privado), necesitas un **VPS con al menos 8 GB de RAM**
(el modelo corre en CPU). Ahí instalas Node + Ollama igual que en tu PC.

**Hosts recomendados con esta opción:**
- **Hetzner Cloud** — el mejor equilibrio precio/rendimiento (plan CPX31: 4 vCPU / 8 GB ≈ €10/mes).
- **Contabo** — el más barato en RAM (VPS de 8 GB ≈ $6–8/mes).
- **Oracle Cloud — Free Tier** — instancia ARM con hasta 24 GB de RAM **gratis para siempre**
  (es la opción $0, pero el registro y la configuración son más técnicos).

Deja `LLM_API_KEY` vacío y configura `OLLAMA_URL` / `OLLAMA_MODEL` si hace falta.

---

## Resumen de la recomendación

- **Rápido, barato y sencillo → Opción A:** Groq (IA en la nube) + **Render** o **Railway**.
- **Todo tuyo y offline → Opción B:** **Hetzner** o **Contabo** (VPS 8 GB) con Ollama, o **Oracle Free Tier** si quieres gratis.

## Desplegar 24/7 en Render (recomendado) — paso a paso

El proyecto ya trae `render.yaml` listo. Solo necesitas:

**1. Consigue una API key de Groq (para la IA, gratis)**
   - Entra a https://console.groq.com → crea cuenta → API Keys → crea una y cópiala.

**2. Sube el proyecto a GitHub**
   - Crea un repositorio nuevo en https://github.com (vacío).
   - Sube esta carpeta `quiosco-uaem-web` a ese repo (ver "Subir a GitHub" abajo).

**3. Conéctalo en Render**
   - Entra a https://render.com → crea cuenta → **New → Blueprint**.
   - Elige tu repo. Render lee `render.yaml` y crea el servicio solo.
   - Te pedirá las variables marcadas (`sync:false`). Pon:
     - `LLM_API_KEY` = tu key de Groq
     - `ADMIN_PASSWORD` = una contraseña segura para el panel
     - `EMAIL_API_KEY` = (opcional) tu key de Resend para correos reales
   - Da **Apply / Deploy**.

**4. Listo**
   - Render te da un link público `https://quiosco-uaem.onrender.com` que **cualquiera puede abrir**.
   - Página: `https://TU-LINK/` · Panel: `https://TU-LINK/admin` (usuario `admin`, la contraseña que pusiste).

> Plan: el `render.yaml` usa `starter` (~$7/mes) para que los datos (usuarios, estudiantes
> registrados, respuestas aprendidas) **no se borren**. Puedes cambiar a `free` para probar,
> pero en free el sitio se "duerme" tras 15 min y los datos se reinician en cada despliegue.

### Subir a GitHub (rápido)

Con Git instalado, dentro de la carpeta `quiosco-uaem-web`:

```bash
git init
git add .
git commit -m "Quiosco UAEM web"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

(Ya dejé `git init` + primer commit hechos; solo te falta crear el repo en GitHub,
poner tu `remote` y hacer `push`.)

### Alternativa: Railway
Similar a Render (railway.app): New Project → Deploy from GitHub → agrega las mismas
variables de entorno. También soporta volumen persistente.

## Notas

- Los datos (usuarios, pendientes, respuestas) se guardan en `datos/*.json`.
  En hosts con disco efímero (Render free, Fly), usa un disco persistente o una BD si
  necesitas que no se borren en cada redeploy.
- El panel muestra avisos cuando está abierto. La carpeta `notificador/` sigue sirviendo
  para avisos de escritorio en la PC de un encargado (apuntando a la URL pública).
- Cambia la contraseña de `admin` en cuanto entres.
