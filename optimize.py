import os
import glob
from PIL import Image

def optimize_images():
    try:
        img = Image.open('Fondoapp-420.webp')
        img_logo = img.resize((70, 70), Image.Resampling.LANCZOS)
        img_logo.save('Fondoapp-logo.webp')
        print("Created Fondoapp-logo.webp")
    except Exception as e:
        print(f"Image processing error: {e}")

def update_html_files():
    html_files = glob.glob('*.html')
    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add defer to scripts
        if '<script src="site-performance.js"></script>' in content:
            content = content.replace('<script src="site-performance.js"></script>', '<script src="site-performance.js" defer></script>')
        if '<script src="cookie-banner.js"></script>' in content:
            content = content.replace('<script src="cookie-banner.js"></script>', '<script src="cookie-banner.js" defer></script>')
        
        # Replace logo in header
        content = content.replace('src="Fondoapp-420.webp" alt="Logo de Acordes Rafa" width="35" height="35"', 'src="Fondoapp-logo.webp" alt="Logo de Acordes Rafa" width="35" height="35"')
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
    print("Updated HTML files.")

if __name__ == "__main__":
    optimize_images()
    update_html_files()
