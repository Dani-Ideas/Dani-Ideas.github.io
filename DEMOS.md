# Demos de portfolio — POS y SGI

Documentación técnica para integrar, desplegar y presentar los demos del sistema ERP
en el portfolio `portfolio.dani-ideas.dev`.

---

## Resumen

| Demo | Ruta en producción | JS (gzip) | CSS (gzip) | Stack |
|---|---|---|---|---|
| POS — Punto de Venta | `/pos-demo/` | ~171 KB | ~7 KB | Vite + React 19 |
| SGI — Inventario | `/sgi-demo/` | ~230 KB | ~7 KB | Vite + React 19 |

**Carga en la página principal del portfolio: 0 bytes.**
Ambos demos son SPAs independientes que solo cargan cuando alguien navega a su URL.
No afectan el tiempo de carga del portfolio en absoluto.

---

## Arquitectura

```
webSite/
├── astro.config.mjs        ← Portfolio principal (Astro 4, output: static)
├── package.json            ← Scripts de build coordinados
├── public/
│   ├── pos-demo/           ← Build del POS demo (copiado desde pos-demo/dist/)
│   │   ├── index.html
│   │   └── assets/         ← JS + CSS con hash, cache immutable 1 año
│   ├── sgi-demo/           ← Build del SGI demo (copiado desde sgi-demo/dist/)
│   │   ├── index.html
│   │   └── assets/
│   └── _headers            ← Reglas de caché Cloudflare Pages
├── pos-demo/               ← Proyecto Vite independiente (fuente POS)
└── sgi-demo/               ← Proyecto Vite independiente (fuente SGI)
```

### Por qué esta estructura no sobrecarga el portfolio

Astro copia `public/` directamente al output `dist/` sin procesarlo ni importarlo.
El HTML del portfolio nunca referencia `pos-demo/` ni `sgi-demo/`, por lo que:

- El browser no descarga ningún archivo de los demos al visitar el portfolio
- Cloudflare Pages sirve `/pos-demo/` y `/sgi-demo/` como rutas estáticas separadas
- Los assets de los demos tienen `Cache-Control: immutable` (1 año) — segunda visita es instantánea

---

## Stack de los demos

Ambos demos usan exactamente el mismo stack:

```
React 19          — UI
React Router v6   — Navegación (HashRouter — no necesita _redirects)
Zustand + persist — Estado global + localStorage (sesión sobrevive recarga)
Tailwind CSS v4   — Estilos (mismas variables CSS que el ecommerce original)
shadcn/ui         — Componentes copiados verbatim del proyecto original
lucide-react      — Iconos
zod + react-hook-form — Formularios
```

SGI demo adicionalmente:
```
xlsx — Exportación de Kardex a .xlsx (descarga en el browser, sin servidor)
```

### Datos mock

Ambos demos usan datos pre-cargados en memoria (Zustand + `localStorage`):
- Sin base de datos
- Sin llamadas a API externas
- Sin autenticación
- Los cambios (aprobar recepciones, cerrar sesión de caja, etc.) persisten en `localStorage`
  y se pueden resetear borrando el storage del browser

---

## Build y despliegue

### Desarrollo local

```bash
# POS demo
cd pos-demo && npm run dev
# → http://localhost:5173/pos-demo/

# SGI demo
cd sgi-demo && npm run dev
# → http://localhost:5173/sgi-demo/
```

### Build completo (para Cloudflare Pages)

```bash
# Desde la raíz del portfolio:
npm run build:all
```

Este comando hace en orden:
1. `cd pos-demo && npm install && npm run build`
2. `cd sgi-demo && npm install && npm run build`
3. `cp -r pos-demo/dist/. public/pos-demo/`
4. `cp -r sgi-demo/dist/. public/sgi-demo/`
5. `astro build`

### Configuración en Cloudflare Pages

| Setting | Valor |
|---|---|
| Build command | `npm run build:all` |
| Build output directory | `dist` |
| Node.js version | 20 |

No se necesita `_redirects` porque ambos demos usan `HashRouter`
(la ruta `#/...` nunca llega al servidor).

---

## Integración en el portfolio Astro

### Opción A — Link directo (recomendado, carga 0 en portfolio)

En `src/data/portfolio.ts`, agregar los demos como proyectos con un botón "Ver demo":

```ts
{
  title: "Sistema POS",
  demoUrl: "/pos-demo/",    // ← URL relativa dentro del mismo dominio
  // ...
}
```

El visitante hace click → navega a `/pos-demo/` → carga el SPA.
El portfolio no carga nada adicional.

### Opción B — Iframe con activación lazy (solo si quieres preview inline)

Si quieres mostrar el demo dentro de una tarjeta del portfolio **sin cargarlo hasta que el usuario haga click**:

```astro
<!-- src/components/DemoCard.astro -->
<div class="demo-card" data-demo-url="/pos-demo/">
  <div class="preview-overlay">
    <button class="launch-btn">▶ Abrir demo</button>
  </div>
  <!-- El iframe se inyecta por JS solo al hacer click -->
  <div class="iframe-container" style="display:none"></div>
</div>

<script>
document.querySelectorAll('.demo-card').forEach(card => {
  const btn = card.querySelector('.launch-btn')
  const container = card.querySelector('.iframe-container')
  const url = card.dataset.demoUrl

  btn.addEventListener('click', () => {
    // Solo crea el iframe al hacer click — 0 carga hasta entonces
    container.innerHTML = `<iframe src="${url}" loading="lazy" allowfullscreen></iframe>`
    card.querySelector('.preview-overlay').style.display = 'none'
    container.style.display = 'block'
  })
})
</script>
```

**Importante para la opción B**: agregar excepción en `_headers` porque la cabecera
`X-Frame-Options: DENY` bloquea iframes. Cambiar a `SAMEORIGIN` para `/pos-demo/` y `/sgi-demo/`:

```
/pos-demo/*
  X-Frame-Options: SAMEORIGIN

/sgi-demo/*
  X-Frame-Options: SAMEORIGIN
```

### Opción C — Ventana emergente (link que abre nueva pestaña)

La más simple y sin configuración extra:

```astro
<a href="/pos-demo/" target="_blank" rel="noopener">
  Ver demo POS ↗
</a>
```

---

## Actualizar los demos

Si se modifica código en `pos-demo/` o `sgi-demo/`, re-buildear y copiar:

```bash
# Solo POS
npm run build:pos-demo && cp -r pos-demo/dist/. public/pos-demo/

# Solo SGI
npm run build:sgi-demo && cp -r sgi-demo/dist/. public/sgi-demo/

# Ambos + portfolio completo
npm run build:all
```

Cloudflare Pages detecta el cambio en `public/` al hacer `git push` y redesplega.

---

## Reset de datos de demo

Los demos guardan estado en `localStorage` del browser. Para resetear a los datos originales:

```js
// En la consola del browser con el demo abierto:
localStorage.removeItem('basictech-pos')        // POS store
localStorage.removeItem('basictech-pos-demo')   // POS demo store
localStorage.removeItem('basictech-sgi-demo')   // SGI demo store
location.reload()
```

O borrar "Almacenamiento del sitio" desde las DevTools del browser.

---

## Limitaciones conocidas de los demos

| Feature | Estado en demo |
|---|---|
| Mercado Pago Point | Bloqueado — muestra mensaje "Modo Demo" |
| Escáner QR (cámara) | No disponible — se sustituye por input de texto |
| Correcciones POS | Historial visible, botones de corrección deshabilitados |
| Crear recepciones/traslados nuevos | Solo disponible la gestión de los pre-existentes |
| Múltiples usuarios / RBAC | Hardcodeado como ADMIN — todo el nav visible |
| Webhooks / pagos reales | No aplica (sin backend) |

---

## Archivos clave

```
pos-demo/src/
  data/mock.ts       → Todos los datos de ejemplo del POS (productos, terminales)
  stores/demo-store.ts  → Zustand: sesiones, órdenes, stock mutable
  api/pos.ts         → Capa mock: mismas firmas que las API routes del proyecto real
  pages/CheckoutPage.tsx → Flujo de pago completo + ticket con QR

sgi-demo/src/
  data/mock.ts       → Productos, almacenes, recepciones, movimientos (30 registros)
  stores/sgi-store.ts   → Zustand: recepciones, traslados, stock mutable
  api/sgi.ts         → Capa mock + Kardex paginado + cálculo de existencias por ubicación
  pages/MovementsPage.tsx → Kardex con búsqueda + exportación XLSX real
  pages/WarehousePage.tsx → Visualización de rutas INPUT→QC→STOCK
```


  Para testear los demos localmente:
  
  npm run build       # genera dist/
  npm run preview     # sirve dist/ con un server estático real
