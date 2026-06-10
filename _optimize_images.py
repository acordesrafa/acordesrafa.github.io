import os
from PIL import Image

img = Image.open('Fondoapp-420.webp')
logo = img.resize((70, 70), Image.Resampling.LANCZOS)
logo.save('Fondoapp-logo.webp')
size = os.path.getsize('Fondoapp-logo.webp')
print(f'Created Fondoapp-logo.webp: 70x70 ({size} bytes)')

img2 = Image.open('Iconogrande.webp')
icon = img2.resize((220, 220), Image.Resampling.LANCZOS)
icon.save('Iconogrande-220.webp')
size2 = os.path.getsize('Iconogrande-220.webp')
print(f'Created Iconogrande-220.webp: 220x220 ({size2} bytes)')

os.remove('_optimize_images.py')
