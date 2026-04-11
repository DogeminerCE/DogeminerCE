# DogeminerCE MSIX Bundling Script
# This script packages the web files into a standalone MSIX for the Microsoft Store.

$ErrorActionPreference = "Stop"

# 1. Parse Version from play/index.html
$indexContent = Get-Content -Path "play/index.html" -Raw
if ($indexContent -match "v(\d+\.\d+(\.\d+)?)") {
    $rawVersion = $Matches[1]
    # MSIX requires 4 parts, e.g. 0.55.0.0
    # Also, it DISALLOWS leading zeros (e.g., 055 must be 55)
    $parts = $rawVersion.Split('.') | ForEach-Object { [int]$_ }
    while ($parts.Count -lt 4) { $parts += 0 }
    $version = $parts -join "."
} else {
    $version = "1.0.0.0" # Fallback
}

Write-Host "Building DogeminerCE MSIX v$version..."

# 2. Setup Directories
$stagingDir = "dist_msix"
if (Test-Path $stagingDir) { Remove-Item -Recurse -Force $stagingDir }
New-Item -ItemType Directory -Path $stagingDir | Out-Null
New-Item -ItemType Directory -Path "$stagingDir\Assets" | Out-Null

# 3. Copy Game Files
Write-Host "Copying core files..."
# Copy the play directory itself to preserve its internal paths
Copy-Item -Path "play" -Destination $stagingDir -Recurse
# Copy root assets (like shibe icons used in game)
if (Test-Path "assets") {
    Copy-Item -Path "assets" -Destination "$stagingDir\assets" -Recurse
}
# Copy root files for reference, but AppxManifest points to play/index.html
if (Test-Path "index.html") { Copy-Item -Path "index.html" -Destination $stagingDir }
if (Test-Path "styles.css") { Copy-Item -Path "styles.css" -Destination $stagingDir }
if (Test-Path "favicon.ico") { Copy-Item -Path "favicon.ico" -Destination $stagingDir }
if (Test-Path "favicon_io") { Copy-Item -Path "favicon_io" -Destination $stagingDir -Recurse }

# 4. Copy Packaging Files
Write-Host "Copying packaging files..."
Copy-Item -Path "packaging\windows\Assets\*" -Destination "$stagingDir\Assets"
$manifestPath = "$stagingDir\AppxManifest.xml"
Copy-Item -Path "packaging\windows\AppxManifest.xml" -Destination $manifestPath

# 5. Injection: Update Version in Identity tag only
$manifestContent = Get-Content -Path $manifestPath -Raw
# Target the Identity tag's version specifically
$manifestContent = $manifestContent -replace '(?i)(<Identity\s+[^>]*?Version=")([^"]*)(")', "`${1}$version`${3}"
Set-Content -Path $manifestPath -Value $manifestContent -Encoding UTF8

# 6. WebView2 Modern Runner Setup
Write-Host "Setting up modern Chromium runner (WebView2)..."
$wv2Temp = "$stagingDir\wv2_sdk"
$nugetPackage = "$stagingDir\webview2.zip"
if (!(Test-Path $wv2Temp)) {
    Write-Host "Downloading WebView2 SDK from NuGet..."
    Invoke-WebRequest -Uri "https://www.nuget.org/api/v2/package/Microsoft.Web.WebView2" -OutFile $nugetPackage
    Expand-Archive -Path $nugetPackage -DestinationPath $wv2Temp -Force
}

# Copy required DLLs for runtime
$dllPathCore = "$wv2Temp\lib\net45\Microsoft.Web.WebView2.Core.dll"
$dllPathWF = "$wv2Temp\lib\net45\Microsoft.Web.WebView2.WinForms.dll"
$dllPathLoader = "$wv2Temp\build\native\x64\WebView2Loader.dll"

Copy-Item $dllPathCore -Destination $stagingDir
Copy-Item $dllPathWF -Destination $stagingDir
Copy-Item $dllPathLoader -Destination $stagingDir

# Compile the Launcher
Write-Host "Compiling DogeMinerCE.exe..."
$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
$references = "/reference:""$dllPathCore"",""$dllPathWF"",""System.Windows.Forms.dll"",""System.Drawing.dll"",""System.dll"""
& $csc /target:winexe /out:"$stagingDir\DogeMinerCE.exe" $references "scripts\DogeLauncher.cs" /nologo

if (!(Test-Path "$stagingDir\DogeMinerCE.exe")) {
    throw "Failed to compile DogeMinerCE.exe"
}

# 7. Create Package (MakeAppx.exe)
$makeAppx = "MakeAppx.exe"
if (!(Get-Command $makeAppx -ErrorAction SilentlyContinue)) {
    # Search for x64 version specifically to avoid picking ARM64/x86 by mistake
    $sdkPath = Get-ChildItem -Path "C:\Program Files (x86)\Windows Kits\10\bin" -Filter "MakeAppx.exe" -Recurse | Where-Object { $_.FullName -like "*\x64\*" } | Select-Object -First 1 -ExpandProperty FullName
    if ($sdkPath) { $makeAppx = $sdkPath }
}

$outMsix = "dogeminerce_$version.msix"
Write-Host "Creating package: $outMsix"
& "$makeAppx" pack /d $stagingDir /p $outMsix /o

# 8. Sign Package (Optional)
$pfx = "packaging\windows\DogeMinerCE_Test.pfx"
if (Test-Path $pfx) {
    Write-Host "Signing package with $pfx..."
    $signTool = "SignTool.exe"
    if (!(Get-Command $signTool -ErrorAction SilentlyContinue)) {
        $sdkPath = Get-ChildItem -Path "C:\Program Files (x86)\Windows Kits\10\bin" -Filter "SignTool.exe" -Recurse | Where-Object { $_.FullName -like "*\x64\*" }| Select-Object -First 1 -ExpandProperty FullName
        if ($sdkPath) { $signTool = $sdkPath }
    }
    & "$signTool" sign /fd SHA256 /a /f $pfx /p dogeminer $outMsix
} else {
    Write-Host "No PFX found at $pfx. Package is unsigned (Store only)."
}

Write-Host "--------------------------------------------------------"
Write-Host "Success! WebView2 MSIX created at $outMsix"
Write-Host "--------------------------------------------------------"
