# Download A-Frame 1.5.0 locally into this project's static vendor folder
$dest = Join-Path -Path $PSScriptRoot -ChildPath 'aframe.min.js'
if (-Not (Test-Path -Path $PSScriptRoot)) { New-Item -ItemType Directory -Path $PSScriptRoot -Force | Out-Null }
$url = 'https://aframe.io/releases/1.5.0/aframe.min.js'
Write-Host "Downloading A-Frame from $url to $dest ..."
try {
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -ErrorAction Stop
    Write-Host "Downloaded successfully."
} catch {
    Write-Host "Download failed: $_"
    Write-Host "You can also download manually from $url and place the file at: $dest"
}
