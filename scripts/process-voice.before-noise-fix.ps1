param(
  [string]$InputDirectory = "voice\raw",
  [string]$OutputDirectory = "voice\processed",

  [int]$BitrateKbps = 192,
  [int]$LeadingSilenceMs = 350,
  [int]$TrailingSilenceMs = 180,

  [double]$PitchFactor = 1.35,
  [double]$SpeedFactor = 1.08,

  [int]$NoiseFloorDb = -28
)

$ErrorActionPreference = "Stop"
$InvariantCulture =
  [System.Globalization.CultureInfo]::InvariantCulture

function Find-FFmpeg {
  $command = Get-Command `
    "ffmpeg" `
    -ErrorAction SilentlyContinue

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

function To-InvariantNumber {
  param(
    [double]$Value,
    [string]$Format = "0.####"
  )

  return $Value.ToString(
    $Format,
    $InvariantCulture
  )
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
    $_.Extension.ToLowerInvariant() -in
      $allowedExtensions
  } |
  Sort-Object Name

if (-not $inputFiles) {
  Write-Host ""
  Write-Host `
    "No audio files found in $InputDirectory" `
    -ForegroundColor Yellow

  exit 0
}

if (
  $PitchFactor -lt 1.0 -or
  $PitchFactor -gt 1.8
) {
  throw "PitchFactor must be between 1.0 and 1.8"
}

if (
  $SpeedFactor -lt 0.8 -or
  $SpeedFactor -gt 1.5
) {
  throw "SpeedFactor must be between 0.8 and 1.5"
}

$pitchText =
  To-InvariantNumber $PitchFactor

$speedText =
  To-InvariantNumber $SpeedFactor

$pitchCompensation =
  1.0 / $PitchFactor

$pitchCompensationText =
  To-InvariantNumber $pitchCompensation

$trailingSeconds =
  To-InvariantNumber (
    $TrailingSilenceMs / 1000.0
  )

Write-Host ""
Write-Host "FFmpeg:" -ForegroundColor Cyan
Write-Host $ffmpegPath

Write-Host ""
Write-Host `
  "Files found: $($inputFiles.Count)" `
  -ForegroundColor Cyan

Write-Host `
  "Pitch factor: $pitchText"

Write-Host `
  "Speed factor: $speedText"

foreach ($file in $inputFiles) {
  $outputName =
    "$($file.BaseName).mp3"

  $outputPath = Join-Path `
    $OutputDirectory `
    $outputName

  Write-Host ""
  Write-Host `
    "Processing: $($file.Name)" `
    -ForegroundColor Green

  Write-Host "Output:     $outputName"

  $filterParts = @(
    # Прибираємо гул і надлишковий низ.
    "highpass=f=85"

    # Відсікаємо зайві високочастотні шуми.
    "lowpass=f=10500"

    # М’яке шумоприглушення.
    "afftdn=nf=${NoiseFloorDb}:tn=1"

    # Трохи прибираємо мутність голосу.
    "equalizer=f=280:t=q:w=1.1:g=-2"

    # Додаємо чіткості й мультяшної яскравості.
    "equalizer=f=3200:t=q:w=1.0:g=3"

    # Підіймаємо висоту тону.
    "asetrate=44100*${pitchText}"

    # Повертаємо стандартну частоту.
    "aresample=44100"

    # Компенсуємо зміну тривалості після pitch.
    "atempo=${pitchCompensationText}"

    # Окремо трохи прискорюємо мовлення.
    "atempo=${speedText}"

    # Вирівнюємо тихі й гучні частини.
    "acompressor=threshold=-20dB:ratio=3:attack=15:release=180:makeup=2"

    # Вирівнюємо загальну гучність.
    "loudnorm=I=-17:LRA=6:TP=-1.5"

    # Не дозволяємо пікам перевантажувати звук.
    "alimiter=limit=0.92:attack=5:release=50"

    # Додаємо тишу перед голосом.
    "adelay=${LeadingSilenceMs}:all=1"

    # Додаємо коротку паузу після фрази.
    "apad=pad_dur=${trailingSeconds}"
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
    throw `
      "FFmpeg failed to process $($file.FullName)"
  }

  if (-not (Test-Path $outputPath)) {
    throw `
      "Output was not created: $outputPath"
  }
}

Write-Host ""
Write-Host `
  "Voice processing completed." `
  -ForegroundColor Green

Write-Host "Output: $OutputDirectory"
Write-Host "Original silence: preserved"
Write-Host "Added leading silence: ${LeadingSilenceMs} ms"
Write-Host "Added trailing silence: ${TrailingSilenceMs} ms"
Write-Host "Noise suppression: enabled"
Write-Host "Compression: enabled"
Write-Host "Limiter: enabled"
Write-Host "Cartoon pitch: ${pitchText}x"
Write-Host "Speech speed: ${speedText}x"
Write-Host "MP3: ${BitrateKbps} kbps, mono, 44.1 kHz"
