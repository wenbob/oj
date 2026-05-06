#!/usr/bin/env bash
set -euo pipefail

DATABASE_PATH="${1:-prisma/dev.db}"
BACKUP_DIR="${2:-backups}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATABASE="$ROOT_DIR/$DATABASE_PATH"
BACKUP_ROOT="$ROOT_DIR/$BACKUP_DIR"

if [[ ! -f "$DATABASE" ]]; then
  echo "SQLite 数据库文件不存在：$DATABASE" >&2
  exit 1
fi

mkdir -p "$BACKUP_ROOT"

timestamp="$(date +%Y%m%d-%H%M%S)"
name="$(basename "$DATABASE" .db)"
backup_path="$BACKUP_ROOT/$name-$timestamp.db"

cp "$DATABASE" "$backup_path"
echo "SQLite 数据库备份成功：$backup_path"
