# ==============================================================================
# NEVOLYN — one-command LOCAL preview (backend + frontend). No Docker needed.
#
#   Usage (from repo root):   .\run-local.ps1
#
# Uses an in-memory H2 database on THIS PC only. It never connects to the VPS or
# production PostgreSQL, and everything resets when the backend stops.
#
# Backend  : http://localhost:8080
# Frontend : http://localhost:3000   (hot reload)
# Phone    : http://<this-PC-IP>:3000/office/login   (same Wi-Fi)
#
# LOCAL-ONLY LOGINS  (username OR employee id)
#   Super Admin pass : super123   (rahinrahman, mninadmnobo)
#   Admin pass       : admin123   (rahinrahman, mninadmnobo, afzalhossan)
#   Employee pass    : rahinrahman=rahin123  mninadmnobo=nobo123
#                      afzalhossan=afzal123  nomrota=nomrota123
# ==============================================================================

$root = $PSScriptRoot
$jdk  = "C:\Program Files\Eclipse Adoptium\jdk-21.0.7.6-hotspot"

# ---- Backend window ----------------------------------------------------------
$backendCmd = @"
`$env:JAVA_HOME = '$jdk'
`$env:JWT_SECRET = '9e3b8a1c7d2e4f5a6b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a'
`$env:SUPER_ADMIN_SHARED_PASSWORD = 'super123'
`$env:ADMIN_SHARED_PASSWORD = 'admin123'
`$env:APP_LOCAL_SEED_ENABLED = 'true'
Set-Location '$root\backend'
.\mvnw.cmd spring-boot:run
"@
Start-Process powershell -ArgumentList '-NoExit', '-Command', $backendCmd

# ---- Frontend window ---------------------------------------------------------
$frontendCmd = @"
`$env:NEXT_PUBLIC_API_URL = 'http://localhost:8080/api/v1'
`$env:OFFICE_BACKEND_API_URL = 'http://localhost:8080/api/v1'
Set-Location '$root\frontend'
npm run dev
"@
Start-Process powershell -ArgumentList '-NoExit', '-Command', $frontendCmd

$ip = (Get-NetIPAddress -AddressFamily IPv4 |
       Where-Object { $_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*' } |
       Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "Starting... wait ~30s, then open:" -ForegroundColor Green
Write-Host "  Laptop : http://localhost:3000/office/login" -ForegroundColor Green
if ($ip) { Write-Host "  Phone  : http://${ip}:3000/office/login  (same Wi-Fi)" -ForegroundColor Cyan }
