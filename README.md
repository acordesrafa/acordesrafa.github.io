# Web de Acordes Rafa 🎸

Esta es la página web para el canal de YouTube **Acordes Rafa**, diseñada para ser 100% gratuita, de código abierto y optimizada para SEO.

## 🚀 Cómo publicar tu sitio gratis

Para cumplir con tu deseo de no pagar licencias ni hosting, te recomiendo las siguientes opciones:

### 1. GitHub Pages (Recomendado)
Es la opción número uno para proyectos Open Source.
- Crea una cuenta en [GitHub](https://github.com).
- Crea un nuevo repositorio llamado `acordesrafa.github.io`.
- Sube los archivos `index.html` y `styles.css`.
- ¡Listo! Tu web estará en `https://acordesrafa.github.io`.

### 2. Netlify
- Ve a [Netlify](https://www.netlify.com).
- Arrastra y suelta la carpeta `acordes_rafa_web`.
- Te darán un dominio gratis (ej: `acordes-rafa.netlify.app`).

---

## 🛠️ Configuración Final

### Formulario de Contacto y Suscripción
He configurado el sitio para usar **Formspree**, que es gratuito.
1. Ve a [Formspree.io](https://formspree.io) y crea una cuenta gratuita.
2. Crea un nuevo "Form" y copia el ID que te darán.
3. En el archivo `index.html`, busca la línea:
   `<form action="https://formspree.io/f/YOUR_ID" method="POST">`
4. Reemplaza `YOUR_ID` con tu ID de Formspree.

### Feed de YouTube Automático
El sitio ya incluye un embed que muestra la lista de reproducción de tus últimos videos. 
Para que funcione perfectamente con tu canal:
1. Tu ID de canal (Channel ID) es necesario. 
2. En `index.html`, busca el `<iframe>` de YouTube.
3. El parámetro `list=UULFx3IAtH4-itXWv_8m-UOg` debe tener tu ID de lista de cargas. (Normalmente es tu Channel ID cambiando la 'C' por una 'U').

---

## 👁️ Contador de Visitas

El contador es **global** (compartido entre todos los visitantes) y funciona con un Worker de **Cloudflare Workers + KV**. No depende de servicios de terceros que puedan caerse.

### Cómo funciona

1. Cada página llama `loadVisitCounter('slug-único')` (definido en `site-performance.js`).
2. El JS genera un `visitorId` único **por dispositivo** (guardado en `localStorage`) y hace `fetch` al Worker: `https://acordesrafa-counter.acordes-rafa.workers.dev/?page=slug&visitor=ID`.
3. El Worker incrementa el contador en KV **solo la primera vez que ese dispositivo visita la página** (el mismo dispositivo recargando no suma) y devuelve `{"page": "slug", "count": N}`.
4. El total es **global**: se comparte entre todos los visitantes y dispositivos, y se muestra con el texto "N visitas desde 2026".
5. Si el Worker fallara, se muestra un contador a 0 (sin errores en consola).

### Deploy del Worker (ya realizado)

El Worker ya está desplegado en `https://acordesrafa-counter.acordes-rafa.workers.dev`. Para redesplegar tras modificar `cloudflare-counter/index.js`:

```bash
cd cloudflare-counter
npx wrangler deploy
```

El namespace KV se llama `VISITS`. La URL del Worker se puede sobrescribir por entorno con `window.ACORDESRAFA_COUNTER_URL`.

### Para añadir el contador a una página nueva

1. En el HTML (footer), añade:
   ```html
   <div id="visitas-container" class="footer-visits">
       <span id="visitas-count"></span>
   </div>
   ```
2. En el `<script>` de la página, llama con un slug único:
   ```html
   <script> loadVisitCounter('slug-único'); </script>
   ```

### Código del Worker

El worker está en la carpeta `cloudflare-counter/index.js`. Si cambias el código, despliégalo en Cloudflare (Workers → acordesrafa-counter → Edit code). El namespace KV se llama `VISITS` (variable binding).

### Límites del plan gratis

- ~100.000 lecturas/día y ~1.000 escrituras/día en KV. Suficiente para tráfico normal de la web.

---

## 🔍 Detalles Técnicos
- **Diseño**: Estilo premium oscuro con detalles en madera y ámbar.
- **Responsivo**: Se adapta a móviles, tablets y computadoras.
- **SEO**: Títulos, descripciones y palabras clave ya integrados para posicionar en Google bajo "acordes de guitarra".
- **Sin Licencias**: Solo usa HTML, CSS y fuentes gratuitas de Google Fonts.
