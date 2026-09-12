#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${PWD}/pgbackups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/pre_migration_pg17_dumpall_${TIMESTAMP}.sql"
DATA_BACKUP="${BACKUP_DIR}/pg17_data_${TIMESTAMP}.tar.gz"
POSTGRES_USER="${POSTGRES_USER:-cheer_system}"
POSTGRES_DB="${POSTGRES_DB:-cheer_db}"

# ---------------------------------------------------------------
# Step 1: Dump all databases
# ---------------------------------------------------------------
echo "=== Step 1: Dumping all databases ==="

dump_db() {
  docker compose exec -T db pg_dumpall -U "${POSTGRES_USER}" > "${BACKUP_FILE}"
}

if docker compose ps --status running db &>/dev/null 2>&1; then
  echo "DB container is running, dumping via docker compose exec..."
  dump_db || {
    echo "docker compose exec failed, falling back to temporary container..."
    TEMP_DUMP=1
  }
else
  echo "DB container is not running."
  TEMP_DUMP=1
fi

if [ "${TEMP_DUMP:-0}" = "1" ]; then
  # Check for existing backups in pgbackups
  LATEST_BACKUP=$(ls -t "${BACKUP_DIR}"/*.sql "${BACKUP_DIR}"/*.dump "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | head -1 || true)
  if [ -n "${LATEST_BACKUP}" ]; then
    echo "Found existing backup: ${LATEST_BACKUP}"
    echo "You can use this instead of creating a new dump."
    echo "To use it, run the script with: SKIP_DUMP=1 BACKUP_FILE=${LATEST_BACKUP} $0"
    echo ""
  fi

  echo "Starting temporary PG17 container to dump data..."
  docker run -d --name pg17-migrate-temp \
    -v "${PWD}/data:/var/lib/postgresql/data" \
    --env-file "${PWD}/.env" \
    postgres:17-alpine

  echo "Waiting for PG17 to accept connections..."
  for i in $(seq 1 30); do
    if docker exec pg17-migrate-temp pg_isready -U "${POSTGRES_USER}" &>/dev/null; then
      echo "PG17 is ready!"
      break
    fi
    if [ "$i" -eq 30 ]; then
      echo "ERROR: PG17 failed to start. Check logs: docker logs pg17-migrate-temp"
      docker rm -f pg17-migrate-temp
      exit 1
    fi
    sleep 2
  done

  docker exec pg17-migrate-temp pg_dumpall -U "${POSTGRES_USER}" > "${BACKUP_FILE}"
  docker rm -f pg17-migrate-temp
fi

echo "Backup written to: ${BACKUP_FILE}"

# ---------------------------------------------------------------
# Step 2: Stop all containers
# ---------------------------------------------------------------
echo ""
echo "=== Step 2: Stopping all containers ==="
docker compose down

# ---------------------------------------------------------------
# Step 3: Back up raw PG17 data directory
# ---------------------------------------------------------------
echo ""
echo "=== Step 3: Backing up raw PG17 data directory ==="
if [ -d "data" ] && [ -n "$(ls -A data 2>/dev/null)" ]; then
  tar czf "${DATA_BACKUP}" -C "$(dirname "${PWD}/data")" "$(basename "${PWD}/data")"
  echo "Data backup written to: ${DATA_BACKUP}"
else
  echo "No existing data directory found, skipping."
fi

# ---------------------------------------------------------------
# Step 4: Clear old PG17 data
# ---------------------------------------------------------------
echo ""
echo "=== Step 4: Clearing old PG17 data ==="
rm -rf data

# ---------------------------------------------------------------
# Step 5: Start PG18
# ---------------------------------------------------------------
echo ""
echo "=== Step 5: Starting db with PostgreSQL 18 ==="
docker compose up -d db
echo "Waiting for PG18 to become healthy..."

for i in $(seq 1 30); do
  HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$(docker compose ps -q db)" 2>/dev/null || echo "starting")
  if [ "${HEALTH}" = "healthy" ]; then
    echo "PG18 is healthy!"
    break
  fi
  if [ "${HEALTH}" = "unhealthy" ]; then
    echo "ERROR: PG18 failed to become healthy. Check logs: docker compose logs db"
    exit 1
  fi
  sleep 2
done

# ---------------------------------------------------------------
# Step 6: Start remaining services
# ---------------------------------------------------------------
echo ""
echo "=== Step 6: Starting remaining services ==="
docker compose up -d

# ---------------------------------------------------------------
# Step 7: Restore backup
# ---------------------------------------------------------------
echo ""
echo "=== Step 7: Restoring backup into PG18 ==="
cat "${BACKUP_FILE}" | docker compose exec -T db psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"
echo "Restore complete."

# ---------------------------------------------------------------
echo ""
echo "=== Migration finished successfully ==="
echo "PG17 data backup:  ${DATA_BACKUP}"
echo "SQL dump:          ${BACKUP_FILE}"
echo ""
echo "Clean up temporary files when ready:"
echo "  rm -f ${BACKUP_FILE}"
echo "  rm -f ${DATA_BACKUP}"
echo ""
echo "To roll back entirely:"
echo "  docker compose down"
echo "  rm -rf data"
echo "  tar xzf ${DATA_BACKUP}"
echo "  docker compose up -d"
