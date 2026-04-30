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
                    target.innerHTML = 'Contador temporalmente fuera de linea';
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
