@echo off
setlocal

cd /d "%~dp0"

set "BUILD_INFO_BACKUP=%TEMP%\order_extraction_build_info_%RANDOM%.py"
copy /y build_info.py "%BUILD_INFO_BACKUP%" >nul

for /f "delims=" %%i in ('git describe --tags --exact-match 2^>nul') do set "TAG_NAME=%%i"
if not defined TAG_NAME for /f "delims=" %%i in ('git describe --tags --abbrev=0 2^>nul') do set "TAG_NAME=%%i"
if not defined TAG_NAME set "TAG_NAME=v0.0.0-dev"
set "VERSION=%TAG_NAME%"
if /i "%VERSION:~0,1%"=="v" set "VERSION=%VERSION:~1%"
for /f "delims=" %%i in ('git rev-parse HEAD 2^>nul') do set "BUILD_COMMIT=%%i"

(
echo from __future__ import annotations
echo.
echo APP_VERSION = "%VERSION%"
echo APP_RELEASE_TAG = "%TAG_NAME%"
echo APP_BUILD_COMMIT = "%BUILD_COMMIT%"
) > build_info.py

py -m pip install -r requirements-desktop.txt pyinstaller
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist "order-extraction-tool-windows.exe" del /q "order-extraction-tool-windows.exe"
py -m PyInstaller --clean --noconfirm --onefile --windowed --name "订单提取工具" --add-data "rules;rules" desktop_app.py
set "BUILD_RESULT=%ERRORLEVEL%"
copy /y "%BUILD_INFO_BACKUP%" build_info.py >nul
del /q "%BUILD_INFO_BACKUP%" >nul 2>nul
if not "%BUILD_RESULT%"=="0" exit /b %BUILD_RESULT%
copy /y "dist\订单提取工具.exe" "order-extraction-tool-windows.exe"

echo Built dist\订单提取工具.exe
echo Created order-extraction-tool-windows.exe
