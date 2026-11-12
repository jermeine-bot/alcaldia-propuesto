$phpCandidates = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe",
    "C:\tools\php",
    "C:\xampp\php",
    "C:\laragon\bin\php"
)
foreach ($p in $phpCandidates) {
    if (Test-Path "$p\php.exe") {
        $env:PATH = "$p;$env:PATH"
        break
    }
}
Write-Host "Iniciando Backend PHP Puro en http://localhost:5505 ..." -ForegroundColor Cyan
Set-Location -Path $PSScriptRoot
php -d upload_max_filesize=500M -d post_max_size=512M -d memory_limit=256M -d max_execution_time=300 -S 0.0.0.0:5505 router.php
