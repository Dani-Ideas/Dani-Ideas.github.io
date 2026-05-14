# Daniel Romero — Portfolio

> **Fullstack Developer** · Next.js · TypeScript · PostgreSQL  
> Ciudad de México · [daniideas0@gmail.com](mailto:daniideas0@gmail.com) · [GitHub](https://github.com/Dani-Ideas) · [LinkedIn](https://linkedin.com/in/daniel-romero-dani-ideas/)

Live site → **[dani-ideas.github.io](https://dani-ideas.github.io)**

---

## Sobre el sitio

Portfolio estático desplegado en GitHub Pages. La animación de fondo es un globo 3D en WebGL (proyecto [encom-globe](https://github.com/roberte777/encom-globe), dependencias modernizadas) renderizado con Three.js. El contenido del portfolio usa una plantilla dark basada en el template de [Aptifolio](https://aptifolio.com), con toda la información de CV integrada manualmente.

**Stack del sitio en sí:**
- WebGL / Three.js (animación del globo)
- HTML estático + CSS (sin build step, listo para GitHub Pages)
- Next.js compiled export (base de la plantilla de UI)

---

## Lo que encontrarás aquí

| Sección | Contenido |
|---|---|
| **Hero** | Nombre, rol, links de contacto |
| **About** | Perfil profesional resumido |
| **Skills** | Stack técnico completo |
| **Experience** | Historial laboral |
| **Projects** | Sistema ERP/POS en producción |
| **Education** | UNAM + Instituto Ingenia |
| **GitHub** | Actividad de contribuciones |

---

## Proyecto destacado: Sistema ERP / POS

Sistema completo de punto de venta e inventario, construido de forma independiente y **actualmente en uso por clientes reales**.

**Funcionalidades:**
- Módulo SGI con Kardex (StockMove), lotes, ubicaciones jerárquicas, recepciones, traslados y salidas
- Pasarelas de pago reales: **Stripe** (checkout) y **Mercado Pago** (MP Point), con pago dividido en POS
- Autenticación segura con **NextAuth v5**, control de sesiones de caja y auditoría completa
- Backend con **Prisma 7 + PostgreSQL** usando transacciones atómicas
- Generación de QR por unidad física y escaneo en POS con auto-reubicación
- Exportación de reportes en XLSX
- Deploy continuo: **Vercel + Supabase**

**Stack:** Next.js 16 · TypeScript · PostgreSQL · Prisma ORM · NextAuth v5 · Zustand · Zod · Tailwind CSS · Stripe · Supabase · SheetJS · Vercel

---

## Estructura del repositorio

```
portfolio/
├── index.html                  # Página principal (template + datos del CV)
├── assets/
│   ├── encom-globe.min.js      # Globo 3D WebGL (build UMD, Three.js)
│   ├── grid.js                 # Geometría hexagonal pre-computada del globo
│   └── equirectangle_projection.png  # Textura del mapa del globo
├── _next/                      # JS/CSS compilado del template de UI
├── fonts/                      # Work Sans (9 pesos, local)
├── manifest.json               # PWA manifest
└── robots.txt
```

---

## Cómo está construido el fondo (encom-globe)

El globo usa **Three.js** con geometría hexagonal y shaders GLSL personalizados. Fue originalmente desarrollado por Roberte777 como réplica del globo del film *Tron: Legacy*. Las dependencias fueron actualizadas a versiones modernas (`three@0.184`, `@tweenjs/tween.js@25`).

**Integración:**
1. Se crea un `<div>` fijo a `z-index: -2`, completamente fuera del árbol de React
2. El globo renderiza su `<canvas>` Three.js dentro de ese div
3. Un `MutationObserver` garantiza que el div de fondo de React (z-index: -1) permanezca transparente
4. Variables CSS del tema (`--color-background`, `--color-card-background`) se sobreescriben con `!important` vía JavaScript para que el globo sea visible a través del contenido

---

## Deploy en GitHub Pages

1. Crear repositorio `<usuario>.github.io` en GitHub
2. Push del contenido de este directorio al branch `main`
3. Habilitar GitHub Pages desde **Settings → Pages → Branch: main / root**
4. El sitio estará disponible en `https://<usuario>.github.io` en ~2 minutos

```bash
git init
git add .
git commit -m "Portfolio inicial — Daniel Romero"
git branch -M main
git remote add origin https://github.com/Dani-Ideas/Dani-Ideas.github.io.git
git push -u origin main
```

---

## Personalización futura

| Qué cambiar | Dónde |
|---|---|
| Foto de perfil | Reemplazar `assets/profile.jpg` y actualizar `image_url` en `index.html` |
| Información del CV | Buscar y reemplazar en `index.html` (datos están en el JSON del RSC payload y en el HTML pre-renderizado) |
| Colores del globo | `baseColor`, `pinColor` en el script de init al final de `index.html` |
| Analytics desactivados | Eliminar el primer `<script>` del `<head>` para reactivarlos |

---

## Contacto

**Daniel Romero** — Fullstack Developer  
[daniideas0@gmail.com](mailto:daniideas0@gmail.com) · [github.com/Dani-Ideas](https://github.com/Dani-Ideas) · [linkedin.com/in/daniel-romero-dani-ideas](https://linkedin.com/in/daniel-romero-dani-ideas/)
