@echo off
if "%1"=="install" goto install
if "%1"=="backend" goto backend
if "%1"=="frontend" goto frontend
if "%1"=="dev" goto dev
echo Usage: make.bat [install^|backend^|frontend^|dev]
goto end

:install
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
cd frontend && npm install
goto end

:backend
.venv\Scripts\uvicorn backend.main:app --reload
goto end

:frontend
cd frontend && npm run dev
goto end

:dev
echo Starting backend and frontend...
start "" cmd /c ".venv\Scripts\uvicorn backend.main:app --reload"
cd frontend && npm run dev
goto end

:end
