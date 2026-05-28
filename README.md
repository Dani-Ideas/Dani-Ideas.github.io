# Daniel Romero — Portfolio

Sitio web de portfolio construido con **Astro** y desplegado en **Cloudflare Pages**.

---

## ¿Qué es Astro?

Astro es un framework de desarrollo web que genera HTML estático en tiempo de build. A diferencia de React o Next.js, no envía JavaScript al navegador a menos que tú lo pongas explícitamente. El resultado es un sitio ultra rápido: solo HTML, CSS y los scripts que tú definas.

### Cómo funciona este proyecto

```
npm run dev    → Astro lee tus archivos .astro, los compila en memoria y sirve localhost:4321
npm run build  → Astro genera la carpeta dist/ con HTML/CSS/JS listo para subir
```

Los archivos `.astro` son como HTML con superpoderes: tienen una sección de lógica arriba (entre `---`) y HTML abajo:

```astro
---
// Esto corre en el servidor (build time), no en el browser
import { person } from '../data/portfolio';
---

<!-- Esto es el HTML que se genera -->
<h1>{person.name}</h1>
```

### Dónde vive cada cosa

| Qué quieres cambiar | Dónde editarlo |
|---|---|
| Tu nombre, rol, email, links | `src/data/portfolio.ts` |
| Experiencia laboral | `src/data/portfolio.ts` → `experience` |
| Proyectos | `src/data/portfolio.ts` → `projects` |
| Educación | `src/data/portfolio.ts` → `education` |
| Habilidades | `src/data/portfolio.ts` → `skills` |
| Colores, fuentes, glass effect | `src/styles/global.css` |
| El globo (colores, velocidad) | `public/scripts/globe.js` |
| Toggle de idioma | `public/scripts/lang-toggle.js` |

---

## Cómo correr el proyecto localmente

Necesitas tener **Node.js 18+** instalado.

```bash
# 1. Instalar dependencias (solo la primera vez)
npm install

# 2. Levantar servidor de desarrollo
npm run dev
# → Abre http://localhost:4321 en tu navegador

# 3. Para parar el servidor
# Ctrl + C en la terminal
```

Cualquier cambio que hagas en los archivos se refleja automáticamente en el navegador.

---

## Deploy en Cloudflare Pages

### ¿Qué es Cloudflare Pages?

Es un servicio de hosting gratuito de Cloudflare. Conectas tu repositorio de GitHub y cada vez que haces `git push`, Cloudflare construye y despliega tu sitio automáticamente. Es gratuito para proyectos personales.

---

### Paso 1 — Sube el código a GitHub

Si aún no tienes el repositorio en GitHub, créalo:

1. Ve a [github.com](https://github.com) → **New repository**
2. Nómbralo como quieras (ej. `portfolio`)
3. Ponlo en **Public** o **Private** (Cloudflare funciona con ambos)
4. No inicialices con README

Luego desde tu terminal, en la carpeta del proyecto:

```bash
# Si es un repo nuevo
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin server

# Si ya tienes el remote
git push origin server
```

> El código debe estar en la rama `server` (no en `main`). Cloudflare desplegará desde esa rama.

---

### Paso 2 — Crea una cuenta en Cloudflare

1. Ve a [cloudflare.com](https://cloudflare.com)
2. Clic en **Sign Up** (es gratis)
3. Regístrate con tu email

---

### Paso 3 — Crea el proyecto en Cloudflare Pages

1. En el dashboard de Cloudflare, en el menú izquierdo busca **Workers & Pages**
2. Clic en **Create**
3. Elige la pestaña **Pages**
4. Clic en **Connect to Git**

---

### Paso 4 — Conecta tu repositorio de GitHub

1. Clic en **Connect GitHub**
2. Autoriza a Cloudflare a acceder a tu GitHub
3. Selecciona el repositorio de tu portfolio
4. Clic en **Begin setup**

---

### Paso 5 — Configura el build

En la pantalla de configuración llena estos campos exactamente así:

| Campo | Valor |
|---|---|
| **Project name** | El nombre que quieras (ej. `daniel-portfolio`) |
| **Production branch** | `server` |
| **Framework preset** | `Astro` (selecciónalo del dropdown) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

En **Environment variables** agrega:

| Variable | Valor |
|---|---|
| `NODE_VERSION` | `20` |

5. Clic en **Save and Deploy**

---

### Paso 6 — Espera el primer deploy

Cloudflare va a:
1. Clonar tu repositorio
2. Correr `npm install`
3. Correr `npm run build`
4. Servir la carpeta `dist/`

Tarda entre 1 y 3 minutos. Cuando termine verás una URL del tipo:

```
https://daniel-portfolio.pages.dev
```

Esa URL es pública desde ese momento.

---

### Paso 7 — Deploys automáticos en el futuro

A partir de aquí, cada vez que hagas:

```bash
git add .
git commit -m "actualizar experiencia"
git push origin server
```

Cloudflare detecta el push automáticamente y despliega la nueva versión. No tienes que hacer nada más.

---

### Dominio personalizado (opcional)

Si tienes un dominio propio (ej. `dani-ideas.dev`):

1. En tu proyecto de Pages → **Custom domains**
2. Clic en **Set up a custom domain**
3. Escribe tu dominio
4. Cloudflare te da instrucciones para apuntar los DNS

Si el dominio está registrado en Cloudflare, se configura automáticamente en segundos.

---

## Comandos de referencia rápida

```bash
npm run dev        # Servidor local → http://localhost:4321
npm run build      # Genera dist/ para producción
npm run preview    # Sirve dist/ localmente para revisar antes de subir
```

```bash
git add src/data/portfolio.ts
git commit -m "actualizar proyectos"
git push origin server    # Cloudflare despliega automáticamente
```
