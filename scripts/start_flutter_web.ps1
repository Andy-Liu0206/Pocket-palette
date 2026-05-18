$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$flutterBin = Join-Path $root ".tooling\flutter\bin"
$env:Path = "$flutterBin;$env:Path"
$env:GIT_CONFIG_GLOBAL = Join-Path $root ".tooling\gitconfig"

Set-Location $root
flutter run -d web-server --web-hostname 0.0.0.0 --web-port 8080
