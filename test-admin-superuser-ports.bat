@echo off
REM Test Admin & Superuser Ports
REM This script tests if the admin and superuser portals and APIs are working

echo ================================
echo Testing Admin & Superuser Ports
echo ================================
echo.

echo === Testing Web Portals ===
call :test_endpoint "Admin Portal" "http://localhost:8080"
call :test_endpoint "Admin Portal Health" "http://localhost:8080/health"
call :test_endpoint "Superuser Portal" "http://localhost:8090"
call :test_endpoint "Superuser Portal Health" "http://localhost:8090/health"
echo.

echo === Testing API Endpoints ===
call :test_endpoint "Identity Service Health" "http://localhost:8000/health"
call :test_endpoint "Identity Service Root" "http://localhost:8000/"
call :test_endpoint "Auth Routes" "http://localhost:8000/api/auth/health"
echo.

echo === Testing Protected Endpoints (should require auth) ===
call :test_endpoint "Superuser List (no auth)" "http://localhost:8000/api/superuser/list"
call :test_endpoint "Admin Users (no auth)" "http://localhost:8000/api/admin/users"
echo.

echo === Checking Docker Containers ===
echo.
docker-compose ps identity-service admin-portal superuser-portal 2>nul
echo.

echo ================================
echo Test Summary
echo ================================
echo.
echo If all tests passed:
echo   [OK] Admin Portal: http://localhost:8080
echo   [OK] Superuser Portal: http://localhost:8090
echo   [OK] Identity API: http://localhost:8000
echo.
echo If tests failed, try:
echo   1. docker-compose build identity-service admin-portal superuser-portal
echo   2. docker-compose up -d identity-service admin-portal superuser-portal
echo   3. docker-compose logs -f identity-service
echo.

goto :eof

:test_endpoint
set "name=%~1"
set "url=%~2"
echo Testing %name%...
curl -s -o nul -w "HTTP %%{http_code}" "%url%" 2>nul
echo.
goto :eof
