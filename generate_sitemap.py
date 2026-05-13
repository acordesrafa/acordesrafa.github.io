import os

base_url = "https://acordesrafa.github.io/"
letras_dir = "letras"

main_pages = [
    ("", 1.0),
    ("acordes.html", 0.9),
    ("guitar-tool.html", 0.9),
    ("sobre-mi.html", 0.8),
    ("leccion-fundamentos.html", 0.7),
    ("leccion-acordes-abiertos.html", 0.7),
    ("leccion-ritmos.html", 0.7),
    ("leccion-armonia.html", 0.7),
    ("leccion-tecnica.html", 0.7),
    ("leccion-escalas.html", 0.7),
    ("contacto.html", 0.5),
    ("privacidad.html", 0.3),
    ("terminos.html", 0.3),
]

xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']

for page, priority in main_pages:
    xml.append(f"  <url>\n    <loc>{base_url}{page}</loc>\n    <priority>{priority}</priority>\n  </url>")

if os.path.exists(letras_dir):
    for filename in sorted(os.listdir(letras_dir)):
        if filename.endswith(".html"):
            xml.append(f"  <url>\n    <loc>{base_url}letras/{filename}</loc>\n    <priority>0.5</priority>\n  </url>")

xml.append("</urlset>")

with open("sitemap.xml", "w", encoding="utf-8") as f:
    f.write("\n".join(xml))
