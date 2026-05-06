param(
  [string]$DatabasePath = "prisma/dev.db",
  [string]$BackupDir = "backups"
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$database = Join-Path $root $DatabasePath
$backupRoot = Join-Path $root $BackupDir

if (-not (Test-Path -LiteralPath $database)) {
  Write-Error "SQLite 数据库文件不存在：$database"
  exit 1
}

if (-not (Test-Path -LiteralPath $backupRoot)) {
  New-Item -ItemType Directory -Path $backupRoot | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$name = [System.IO.Path]::GetFileNameWithoutExtension($database)
$backupPath = Join-Path $backupRoot "$name-$timestamp.db"

Copy-Item -LiteralPath $database -Destination $backupPath -Force
Write-Host "SQLite 数据库备份成功：$backupPath"
