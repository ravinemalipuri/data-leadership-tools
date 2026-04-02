@echo off
cd /d "%~dp0"
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d proj-tech-debt -f init_pm_schema.sql
echo.
echo Done. Check output above for any errors.
pause
