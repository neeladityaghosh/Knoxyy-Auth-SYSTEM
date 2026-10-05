@echo off
title KNOXYY 69 - Auth Server & Dashboard
cd /d "%~dp0"

echo ========================================================
echo         KNOXYY 69 - REAL-TIME LICENSE SERVER
echo ========================================================
echo.
echo [*] Starting server on http://127.0.0.1:8080 ...
echo [*] Opening Web Dashboard in your browser...
echo.

start "" "http://127.0.0.1:8080/dashboard"
"python\python.exe" server.py

pause
