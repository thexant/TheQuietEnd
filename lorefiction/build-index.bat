@echo off
setlocal

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-index.ps1"

if errorlevel 1 (
  echo Failed to rebuild lore index.
  exit /b 1
)

echo Lore index updated.
exit /b 0
