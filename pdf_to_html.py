"""
pdf_to_html.py
Extrae el contenido de los PDFs de acordes manteniendo la posición
horizontal de los acordes sobre la letra usando <pre> con fuente monoespaciada.
Genera además páginas HTML estáticas por cada canción para mejorar el SEO (AdSense).

Uso: python pdf_to_html.py
Genera: 
1. songs_data.js  (se incluye en acordes.html)
2. Carpeta canciones/ con archivos HTML individuales
3. Actualiza sitemap.xml automáticamente
"""

import os
import json
import re
import pdfplumber
import xml.etree.ElementTree as ET
from datetime import datetime

# === CONFIGURACIÓN ===
FOLDERS = {
    "populares": "Cancionero Popular",
    "dios": "Canciones para Dios Word"
}
OUTPUT_JS = "songs_data.js"
SEO_FOLDER = "canciones"
SITEMAP = "sitemap.xml"

# HTML Template para las páginas SEO individuales
HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Letra y Acordes | Acordes Rafa</title>
    <meta name="description" content="Aprende a tocar los acordes y la letra de {title} en guitarra. Tutorial completo y cancionero.">
    <meta name="keywords" content="{title} acordes, {title} letra, acordes de guitarra, cancionero {category}">
    <link rel="canonical" href="https://acordesrafa.github.io/canciones/{safe_name}.html">
    <link rel="stylesheet" href="../styles.css">
    <link rel="icon" href="../Fondoapp.webp">
    <!-- Google AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2394918736393015" crossorigin="anonymous"></script>
    <style>
        .song-container {{ max-width: 900px; margin: 150px auto 50px; padding: 30px; background: white; border-radius: 16px; box-shadow: var(--shadow-soft); }}
        .chord-sheet {{ font-family: 'Courier New', Courier, monospace; font-size: 1.1rem; line-height: 1.6; color: #1a1a1a; white-space: pre-wrap; overflow-x: auto; background: #fdfdfd; padding: 25px; border-radius: 12px; border: 1px solid #eee; }}
        .btn-back {{ display: inline-flex; align-items: center; justify-content: center; background: var(--stripe-blue); color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; transition: 0.3s; }}
        .btn-back:hover {{ transform: translateY(-2px); filter: brightness(1.1); }}
    </style>
</head>
<body>
    <header>
        <nav>
            <a href="../index.html" class="logo">
                <img src="../Fondoapp.webp" alt="Icono">
                Acordes Rafa
            </a>
            <ul class="nav-links">
                <li><a href="../index.html">Inicio</a></li>
                <li><a href="../acordes.html" class="active">Letras con Acordes</a></li>
                <li><a href="../guitar-tool.html">🎸 Herramienta</a></li>
            </ul>
        </nav>
    </header>

    <div class="song-container">
        <h1 style="font-family: 'Outfit', sans-serif; color: var(--stripe-blue); margin-bottom: 20px; text-align: center;">{title}</h1>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 30px;">Letra y Acordes para guitarra acústica y eléctrica. <strong><a href="../acordes.html" style="color: var(--stripe-blue);">Ir al Visor Interactivo y PDF</a></strong></p>
        
        {html_content}

        <div style="text-align: center; margin-top: 40px;">
            <a href="../acordes.html" class="btn-back">⬅ Volver al Cancionero Principal</a>
        </div>
    </div>

    <footer>
        <div class="container" style="text-align: center; padding: 20px;">
            <p>&copy; 2026 Acordes Rafa. Todos los derechos reservados.</p>
        </div>
    </footer>
</body>
</html>"""


def extract_pdf_to_html(pdf_path, pdf_file):
    """
    Extrae el texto de un PDF preservando la alineación de acordes.
    """
    try:
        html_pages = []
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                words = page.extract_words(x_tolerance=3, y_tolerance=3, keep_blank_chars=False, use_text_flow=False)
                if not words: continue

                lines = {}
                for word in words:
                    y_key = round(word["top"] / 5) * 5
                    if y_key not in lines: lines[y_key] = []
                    lines[y_key].append(word)

                sorted_ys = sorted(lines.keys())
                PAGE_WIDTH = page.width or 595
                CHARS = 90
                scale = CHARS / PAGE_WIDTH

                pre_lines = []
                for y in sorted_ys:
                    row_words = sorted(lines[y], key=lambda w: w["x0"])
                    char_line = [" "] * CHARS
                    for word in row_words:
                        col = int(word["x0"] * scale)
                        text = word["text"]
                        for i, ch in enumerate(text):
                            pos = col + i
                            if pos < CHARS: char_line[pos] = ch
                    pre_lines.append("".join(char_line).rstrip())

                cleaned = []
                prev_empty = False
                for line in pre_lines:
                    is_empty = line.strip() == ""
                    if is_empty and prev_empty: continue
                    cleaned.append(line)
                    prev_empty = is_empty

                if len(html_pages) == 0 and cleaned:
                    name_clean = re.sub(r'\d+$', '', pdf_file[:-4]).replace('(', ' ').replace(')', ' ')
                    name_words = [w.lower() for w in name_clean.split() if w.isalpha() and len(w) > 1]
                    if not name_words: name_words = [w.lower() for w in name_clean.split()]
                    
                    start_idx = 0
                    for idx, line in enumerate(cleaned):
                        line_lower = line.lower()
                        matches = sum(1 for w in name_words if w in line_lower)
                        if matches > 0 and (matches >= len(name_words)/2 or name_words[0] in line_lower):
                            start_idx = idx
                            break
                    cleaned = cleaned[start_idx:]

                escaped = "\n".join(ln.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;") for ln in cleaned)
                html_pages.append(f'<pre class="chord-sheet">{escaped}</pre>')

        return "<hr class=\"page-break\">".join(html_pages) if html_pages else ""

    except Exception as e:
        print(f"  ERROR en {pdf_path}: {e}")
        return ""

def update_sitemap(new_urls):
    """Añade las nuevas URLs al archivo sitemap.xml"""
    if not os.path.exists(SITEMAP):
        return
    
    ET.register_namespace('', "http://www.sitemaps.org/schemas/sitemap/0.9")
    tree = ET.parse(SITEMAP)
    root = tree.getroot()
    namespace = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    
    existing_urls = set()
    for url in root.findall(f"{namespace}url"):
        loc = url.find(f"{namespace}loc")
        if loc is not None:
            existing_urls.add(loc.text.strip())
            
    today = datetime.now().strftime("%Y-%m-%d")
    added = 0
    
    for url in new_urls:
        if url not in existing_urls:
            url_el = ET.SubElement(root, "url")
            loc_el = ET.SubElement(url_el, "loc")
            loc_el.text = url
            lastmod_el = ET.SubElement(url_el, "lastmod")
            lastmod_el.text = today
            freq_el = ET.SubElement(url_el, "changefreq")
            freq_el.text = "monthly"
            prio_el = ET.SubElement(url_el, "priority")
            prio_el.text = "0.6"
            added += 1
            
    if added > 0:
        # Save prettified string
        xmlstr = ET.tostring(root, encoding='utf-8', xml_declaration=True).decode('utf-8')
        with open(SITEMAP, "w", encoding="utf-8") as f:
            f.write(xmlstr)
        print(f"Sitemap actualizado: {added} nuevas URLs añadidas.")

def main():
    songs_html = {}
    total = 0
    errors = 0
    generated_urls = []

    if not os.path.exists(SEO_FOLDER):
        os.makedirs(SEO_FOLDER)

    for cat_key, folder in FOLDERS.items():
        if not os.path.isdir(folder):
            print(f"!!! Carpeta no encontrada: {folder}")
            continue

        pdfs = [f for f in os.listdir(folder) if f.endswith(".pdf")]
        print(f"\nProcesando {folder}  ({len(pdfs)} PDFs)")

        for pdf_file in sorted(pdfs):
            pdf_path = os.path.join(folder, pdf_file)
            print(f"  -> {pdf_file[:60]}...", end=" ", flush=True)
            html = extract_pdf_to_html(pdf_path, pdf_file)
            
            if html:
                key = f"{cat_key}/{pdf_file}"
                songs_html[key] = html
                
                # Nombre de la canción limpio para el título
                title_match = re.search(r"^(.*?)(?:\(|[0-9]{3,})", pdf_file)
                song_title = title_match.group(1).strip() if title_match else pdf_file.replace(".pdf", "")
                
                # Nombre seguro (slug) para el archivo HTML
                safe_name = re.sub(r'[^a-zA-Z0-9]+', '-', song_title.lower()).strip('-')
                if not safe_name: safe_name = f"cancion-{total}"
                
                html_export = HTML_TEMPLATE.format(
                    title=song_title,
                    safe_name=safe_name,
                    category=cat_key,
                    html_content=html
                )
                
                html_filepath = os.path.join(SEO_FOLDER, f"{safe_name}.html")
                with open(html_filepath, "w", encoding="utf-8") as f:
                    f.write(html_export)
                
                generated_urls.append(f"https://acordesrafa.github.io/{SEO_FOLDER}/{safe_name}.html")
                total += 1
                print("OK")
            else:
                errors += 1
                print("ERROR")

    # Guardamos en JS para el front-end React/SPA interactivo
    with open(OUTPUT_JS, "w", encoding="utf-8") as f:
        f.write("// Generado automáticamente por pdf_to_html.py\n")
        f.write("// Contiene el texto HTML de cada canción extraído del PDF\n\n")
        f.write("const songsHtmlData = ")
        json.dump(songs_html, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    # Actualizar Sitemap
    update_sitemap(generated_urls)

    print(f"\nCompletado! {total} canciones exportadas.")
    print(f" -> Funcionalidad SPA (JS) actualizada: {OUTPUT_JS}")
    print(f" -> Archivos HTML para SEO (AdSense) generados en: {SEO_FOLDER}/")
    if errors:
        print(f"ATENCION: {errors} PDFs con errores")

if __name__ == "__main__":
    main()
