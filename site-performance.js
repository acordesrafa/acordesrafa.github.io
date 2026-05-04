function runWhenIdle(callback) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, { timeout: 2500 });
    } else {
        setTimeout(callback, 1200);
    }
}

function loadVisitCounter(path) {
    const target = document.getElementById('visitas-count');
    if (!target) return;

    window.addEventListener('load', () => {
        runWhenIdle(() => {
            fetch(`https://api.counterapi.dev/v1/acordesrafa/${path}/up`)
                .then(res => {
                    if (!res.ok) throw new Error('Servicio no disponible');
                    return res.json();
                })
                .then(data => {
                    target.innerHTML = `<strong>${data.count.toLocaleString()}</strong> visitas desde 2026`;
                })
                .catch(err => {
                    console.error('Error al cargar visitas:', err);
                    // Hide container if it fails to avoid showing "Cargando..." or error
                    const container = document.getElementById('visitas-container');
                    if (container) container.style.display = 'none';
                });
        });
    });
}

function loadAdsense() {
    window.addEventListener('load', () => {
        runWhenIdle(() => {
            const ads = document.createElement('script');
            ads.async = true;
            ads.crossOrigin = 'anonymous';
            ads.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2394918736393015';
            document.head.appendChild(ads);
        });
    });
}

function initCookieBanner() {
    if (localStorage.getItem('cookies-accepted') === 'true') return;

    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #1a1a1a;
        color: #fff;
        padding: 14px 20px;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        z-index: 9999;
        flex-wrap: wrap;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
        font-family: sans-serif;
    `;

    banner.innerHTML = `
        <span>Usamos cookies para mejorar tu experiencia y mostrar anuncios relevantes. 
        <a href="privacidad.html" style="color: #f0a500; text-decoration: underline;">Política de privacidad</a></span>
        <button id="accept-cookies" style="
            background: #f0a500;
            border: none;
            padding: 8px 18px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            color: #000;
            transition: background 0.2s;
        ">Aceptar</button>
    `;

    document.body.appendChild(banner);

    document.getElementById('accept-cookies').addEventListener('click', () => {
        banner.style.display = 'none';
        localStorage.setItem('cookies-accepted', 'true');
    });
}

// Auto-init cookie banner
window.addEventListener('DOMContentLoaded', initCookieBanner);
