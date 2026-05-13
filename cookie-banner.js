(function() {
    // Check if the user has already accepted cookies
    if (localStorage.getItem('cookies_aceptadas') === 'true') {
        return;
    }

    // Create the banner container
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    
    // Inline styles for the banner
    const styles = `
        #cookie-banner {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: #1e1e2e;
            color: #ffffff;
            padding: 20px;
            z-index: 9999;
            box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-family: 'Inter', sans-serif;
            animation: slideUp 0.5s ease-out;
        }
        @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .cookie-content {
            max-width: 1000px;
            margin-bottom: 15px;
            font-size: 0.95rem;
            line-height: 1.5;
        }
        .cookie-buttons {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            justify-content: center;
        }
        .cookie-btn {
            padding: 10px 25px;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
            text-decoration: none;
            border: none;
        }
        .btn-accept {
            background: linear-gradient(135deg, #6C63FF, #8B83FF);
            color: white;
            box-shadow: 0 4px 10px rgba(108, 99, 255, 0.3);
        }
        .btn-accept:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(108, 99, 255, 0.4);
            filter: brightness(1.1);
        }
        .btn-info {
            background: transparent;
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .btn-info:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: #ffffff;
        }
        @media (max-width: 768px) {
            #cookie-banner {
                padding: 15px;
            }
            .cookie-content {
                font-size: 0.85rem;
            }
            .cookie-btn {
                padding: 8px 20px;
                font-size: 0.8rem;
            }
        }
    `;

    // Add styles to head
    const styleSheet = document.createElement('style');
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Set banner content
    banner.innerHTML = `
        <div class="cookie-content">
            Usamos cookies propias y de terceros (incluyendo Google AdSense) para mejorar tu experiencia y mostrar publicidad personalizada. Consulta nuestra <a href="privacidad.html" style="color: #8B83FF; text-decoration: underline;">Política de Privacidad</a>.
        </div>
        <div class="cookie-buttons">
            <button id="accept-cookies" class="cookie-btn btn-accept">Aceptar</button>
            <a href="privacidad.html" class="cookie-btn btn-info">Más información</a>
        </div>
    `;

    // Append banner to body
    document.body.appendChild(banner);

    // Event listener for the accept button
    document.getElementById('accept-cookies').addEventListener('click', function() {
        localStorage.setItem('cookies_aceptadas', 'true');
        banner.style.display = 'none';
    });
})();
