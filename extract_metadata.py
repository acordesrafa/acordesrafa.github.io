import json
import re
import os

def extract_metadata():
    if not os.path.exists('acordes.html'):
        print("acordes.html not found")
        return
    
    with open('acordes.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple regex to find the object. It's between 'const cancionero = {' and the next '};'
    match = re.search(r'const cancionero = (\{.*?\});', content, re.DOTALL)
    if not match:
        print("Could not find cancionero object")
        # Fallback to a simpler search
        start_marker = 'const cancionero = '
        start = content.find(start_marker)
        if start != -1:
            start += len(start_marker)
            # Find the balanced brace or just the end of the script
            # For simplicity, we know it ends with }; before the next script or block
            end = content.find('};', start) + 1
            data_str = content[start:end]
        else:
            return
    else:
        data_str = match.group(1)
    
    # The string is JavaScript, not strictly JSON (it has unquoted keys and single quotes)
    # We need to convert it to valid JSON if we want to use json.loads, 
    # but it's easier to just use it as a string in Python if we were writing Python code.
    # However, since we want to READ it in pdf_to_html.py, let's try to make it a bit cleaner.
    
    # For now, I'll just save it as a raw JS-like string that I can evaluate or parse loosely.
    with open('cancionero_raw.txt', 'w', encoding='utf-8') as f:
        f.write(data_str)
    print("Extracted to cancionero_raw.txt")

if __name__ == "__main__":
    extract_metadata()
