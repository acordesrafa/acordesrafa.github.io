import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BLOG_DIR = os.path.join(BASE_DIR, "blog")

def clean_file(filepath, is_blog_article=False):
    print(f"Limpiando {os.path.basename(filepath)}...")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Eliminar bloque <style>...</style> si existe en <head>
    cleaned_content = re.sub(r'<style>.*?</style>', '', content, flags=re.DOTALL)
    
    # 2. Si es un artículo de blog, asegurar que el enlace Blog esté activo
    if is_blog_article:
        # Reemplazar <li><a href="../blog/index.html">Blog</a></li> con la clase active
        target_link = '<li><a href="../blog/index.html">Blog</a></li>'
        active_link = '<li><a href="../blog/index.html" class="active">Blog</a></li>'
        cleaned_content = cleaned_content.replace(target_link, active_link)
        
        # También buscar variaciones con espacios
        target_link_var = '<li><a href="../blog/index.html" >Blog</a></li>'
        cleaned_content = cleaned_content.replace(target_link_var, active_link)

    # 3. Guardar si hubo cambios
    if cleaned_content != content:
        # Crear backup
        with open(filepath + ".bak", "w", encoding="utf-8") as f:
            f.write(content)
        # Guardar limpio
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(cleaned_content)
        print(f"  -> MODIFICADO (Creado backup .bak)")
    else:
        print(f"  -> Sin cambios necesarios")

def main():
    # Procesar lecciones
    for file in os.listdir(BASE_DIR):
        if file.startswith("leccion-") and file.endswith(".html"):
            clean_file(os.path.join(BASE_DIR, file), is_blog_article=False)
            
    # Procesar artículos de blog
    if os.path.exists(BLOG_DIR):
        for file in os.listdir(BLOG_DIR):
            if file.endswith(".html") and file != "index.html" and file != "plantilla-articulo.html":
                clean_file(os.path.join(BLOG_DIR, file), is_blog_article=True)

if __name__ == "__main__":
    main()
