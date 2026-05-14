(function migrateLegacyCookieConsent() {
    try {
        if (localStorage.getItem('cookies-accepted') === 'true' && localStorage.getItem('cookies_aceptadas') !== 'true') {
            localStorage.setItem('cookies_aceptadas', 'true');
        }
    } catch (e) { /* private mode / blocked storage */ }
})();

/**
 * Consent Mode v2 + Google tag (gtag.js). ID de medición GA4 (G-…) desde Google Analytics / etiqueta del sitio.
 */
var ACORDESRAFA_GOOGLE_TAG_ID = 'G-QCXGHBB63Y';

(function initConsentModeV2() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
        window.dataLayer.push(arguments);
    };

    var deniedBase = {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted'
    };

    var eeaUkCh = [
        'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE',
        'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
        'GB', 'CH'
    ];

    window.gtag('consent', 'default', Object.assign({}, deniedBase, { region: eeaUkCh, wait_for_update: 500 }));
    window.gtag('consent', 'default', Object.assign({}, deniedBase));

    var stored = false;
    try {
        stored = localStorage.getItem('cookies_aceptadas') === 'true';
    } catch (err) { /* noop */ }

    if (stored) {
        acordesRafaGrantAdsConsentUpdate();
    }
})();

var consentGtagScriptRequested = false;

function ensureGtagJsLoaded() {
    if (!ACORDESRAFA_GOOGLE_TAG_ID) return;
    if (consentGtagScriptRequested) return;
    if (document.querySelector('script[data-acordesrafa-gtag]')) return;
    consentGtagScriptRequested = true;
    var s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-acordesrafa-gtag', '');
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ACORDESRAFA_GOOGLE_TAG_ID);
    s.onload = function() {
        window.gtag('js', new Date());
        if (/^G-/.test(ACORDESRAFA_GOOGLE_TAG_ID)) {
            window.gtag('config', ACORDESRAFA_GOOGLE_TAG_ID);
        } else {
            window.gtag('config', ACORDESRAFA_GOOGLE_TAG_ID, { send_page_view: false });
        }
    };
    document.head.appendChild(s);
}

function acordesRafaGrantAdsConsentUpdate() {
    if (typeof window.gtag !== 'function') return;
    var consentUpdate = {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'denied'
    };
    if (/^G-/.test(ACORDESRAFA_GOOGLE_TAG_ID || '')) {
        consentUpdate.analytics_storage = 'granted';
    }
    window.gtag('consent', 'update', consentUpdate);
    ensureGtagJsLoaded();
}

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
                    const container = document.getElementById('visitas-container');
                    if (container) container.style.display = 'block';
                })
                .catch(err => {
                    console.error('Error al cargar visitas:', err);
                    const container = document.getElementById('visitas-container');
                    if (container) container.style.display = 'none';
                });
        });
    });
}

var ADSENSE_SCRIPT_SEL = 'script[data-acordesrafa-adsense]';

function injectAdsenseScript() {
    if (document.querySelector(ADSENSE_SCRIPT_SEL)) return;

    function append() {
        if (document.querySelector(ADSENSE_SCRIPT_SEL)) return;
        const ads = document.createElement('script');
        ads.async = true;
        ads.crossOrigin = 'anonymous';
        ads.setAttribute('data-acordesrafa-adsense', '');
        ads.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2394918736393015';
        document.head.appendChild(ads);
    }

    if (document.readyState === 'complete') {
        runWhenIdle(append);
    } else {
        window.addEventListener('load', function onAdsLoad() {
            window.removeEventListener('load', onAdsLoad);
            runWhenIdle(append);
        });
    }
}

function loadAdsense() {
    try {
        if (localStorage.getItem('cookies_aceptadas') !== 'true') return;
    } catch (e) {
        return;
    }
    acordesRafaGrantAdsConsentUpdate();
    injectAdsenseScript();
}
