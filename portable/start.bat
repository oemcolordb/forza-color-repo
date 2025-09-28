@echo off
echo Starting Forza Color Universe...
echo.
echo Installing http-server...
npm install -g http-server
echo.
echo Starting server...
cd app
http-server -p 8080 -o --cors
pause