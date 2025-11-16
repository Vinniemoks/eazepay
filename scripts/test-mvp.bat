@echo off
echo 🧪 Testing Eazepay MVP...
echo.

set BASE_URL=http://localhost

REM Test health endpoints
echo === Health Checks ===
curl -s %BASE_URL%/health
echo.
curl -s %BASE_URL%:8000/health
echo.
curl -s %BASE_URL%:8003/health
echo.
curl -s %BASE_URL%:8004/health
echo.

REM Generate unique phone number
set /a PHONE=254700000000 + %RANDOM%

echo === User Registration ===
echo Registering user with phone: %PHONE%
curl -X POST %BASE_URL%/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"phoneNumber\":\"%PHONE%\",\"fullName\":\"Test User\",\"email\":\"test%PHONE%@example.com\",\"password\":\"TestPass123\"}"
echo.
echo.

echo === User Login ===
curl -X POST %BASE_URL%/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"phoneNumber\":\"%PHONE%\",\"password\":\"TestPass123\"}"
echo.
echo.

echo ⚠️  To continue testing, copy the accessToken from above and run:
echo curl -X POST %BASE_URL%/api/wallet/create -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d "{\"currency\":\"KES\"}"
echo.
