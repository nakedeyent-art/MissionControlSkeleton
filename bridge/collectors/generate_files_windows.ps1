$ErrorActionPreference = "Stop"

$home = $env:USERPROFILE
$roots = @(
  Join-Path $home "Documents",
  Join-Path $home "Downloads",
  Join-Path $home "Desktop"
)

$paths = @()
foreach ($root in $roots) {
  if (Test-Path $root) {
    $paths += Get-ChildItem -Path $root -Recurse -File | ForEach-Object { $_.FullName }
  }
}

$outFile = Join-Path (Split-Path $MyInvocation.MyCommand.Path -Parent) "..\\files.json"
$paths | ConvertTo-Json -Depth 2 | Set-Content -Path $outFile -Encoding utf8
Write-Host "Wrote $($paths.Count) files to $outFile"
