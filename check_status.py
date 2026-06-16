import subprocess
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(BASE_DIR, "git_status.txt")

try:
    # Run with shell=True for windows environment resolution
    result = subprocess.run("git status", shell=True, capture_output=True, text=True, encoding="utf-8", errors="ignore")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("STDOUT:\n")
        f.write(result.stdout)
        if result.stderr:
            f.write("\nSTDERR:\n")
            f.write(result.stderr)
    print("git_status.txt escrito con éxito.")
except Exception as e:
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(f"EXCEPTION:\n{str(e)}\n")
        f.write(f"Sys executable: {sys.executable}\n")
    print(f"Error registrado: {e}")
