@echo off
cd /d "%~dp0"
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt -q
echo.
echo Starting RAID Log API on http://localhost:8000
echo Database : proj-tech-debt  ^|  Schema: PM
echo API docs : http://localhost:8000/docs
echo.
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
