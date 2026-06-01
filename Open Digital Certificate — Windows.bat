@echo off
cd /d "%~dp0app"
set PORT=8765
echo Starting certificate app at http://localhost:%PORT%/
echo Keep this window open while using the app.
start "" "http://localhost:%PORT%/"
python -m http.server %PORT% 2>nul || py -m http.server %PORT%
pause
