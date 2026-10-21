$phpPath = "C:\Users\yacel\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe"
if (Test-Path "$phpPath\php.exe") {
    $env:PATH = "$phpPath;$env:PATH"
}
Write-Host "Iniciando Backend PHP Puro en http://localhost:5505 ..." -ForegroundColor Cyan
Set-Location -Path $PSScriptRoot
php -d upload_max_filesize=100M -d post_max_size=105M -d max_execution_time=120 -S 0.0.0.0:5505 router.php
