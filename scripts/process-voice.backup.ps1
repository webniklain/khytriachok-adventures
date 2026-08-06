param(
  [string]$InputDirectory = "voice\raw",
  [string]$OutputDirectory = "voice\processed",
  [int]$BitrateKbps = 192,
  [int]$LeadingSilenceMs = 350,
  [int]$TrailingSilenceMs = 150
)

$ErrorActionPreference = "Stop"

function Find-FFmpeg {
  $command = Get-Command "ffmpeg" -ErrorAction SilentlyContinue

  if ($command) {
    return $command.Source
  }

  $wingetRoot = Join-Path `
    $env:LOCALAPPDATA `
    "Microsoft\WinGet\Packages"

  if (Test-Path $wingetRoot) {
    $ffmpegFile = Get-ChildItem `
      $wingetRoot `
      -Recurse `
      -Filter "ffmpeg.exe" `
      -File `
      -ErrorAction SilentlyContinue |
      Select-Object -First 1

    if ($ffmpegFile) {
      return $ffmpegFile.FullName
    }
  }

  return $null
}

$ffmpegPath = Find-FFmpeg

if (-not $ffmpegPath) {
  throw @"
FFmpeg not found.

Install it with:
winget install --id Gyan.FFmpeg -e
"@
}

New-Item `
  -ItemType Directory `
  -Path $InputDirectory `
  -Force |
  Out-Null

New-Item `
  -ItemType Directory `
  -Path $OutputDirectory `
  -Force |
  Out-Null

$allowedExtensions = @(
  ".m4a",
  ".aac",
  ".wav",
  ".mp3",
  ".caf",
  ".mov"
)

$inputFiles = Get-ChildItem `
  -Path $InputDirectory `
  -File |
  Where-Object {
    $_.Extension.ToLowerInvariant() -in $allowedExtensions
  } |
  Sort-Object Name

if (-not $inputFiles) {
  Write-Host ""
  Write-Host "No audio files found in:" -ForegroundColor Yellow
  Write-Host $InputDirectory
  exit 0
}

Write-Host ""
Write-Host "FFmpeg:" -ForegroundColor Cyan
Write-Host $ffmpegPath

Write-Host ""
Write-Host "Files found: $($inputFiles.Count)" -ForegroundColor Cyan

$trailingSilenceSeconds =
  ($TrailingSilenceMs / 1000).ToString(
    "0.###",
    [System.Globalization.CultureInfo]::InvariantCulture
  )

foreach ($file in $inputFiles) {
  $outputName =
    "$($file.BaseName).mp3"

  $outputPath = Join-Path `
    $OutputDirectory `
    $outputName

  Write-Host ""
  Write-Host "Processing: $($file.Name)" -ForegroundColor Green
  Write-Host "Output:     $outputName"

  $filterParts = @(
    "loudnorm=I=-18:LRA=7:TP=-1.5"
    "adelay=${LeadingSilenceMs}:all=1"
    "apad=pad_dur=${trailingSilenceSeconds}"
  )

  $audioFilter =
    $filterParts -join ","

  & $ffmpegPath `
    -hide_banner `
    -loglevel error `
    -y `
    -i $file.FullName `
    -vn `
    -af $audioFilter `
    -ar 44100 `
    -ac 1 `
    -codec:a libmp3lame `
    -b:a "${BitrateKbps}k" `
    $outputPath

  if ($LASTEXITCODE -ne 0) {
    throw "FFmpeg failed to process: $($file.FullName)"
  }

  if (-not (Test-Path $outputPath)) {
    throw "Output file was not created: $outputPath"
  }
}

Write-Host ""
Write-Host "Processing completed successfully." -ForegroundColor Green
Write-Host "Output directory: $OutputDirectory"
Write-Host "Leading silence added: ${LeadingSilenceMs} ms"
Write-Host "Trailing silence added: ${TrailingSilenceMs} ms"
Write-Host "Original silence was preserved."
Write-Host "Format: MP3 ${BitrateKbps} kbps, mono, 44.1 kHz"
