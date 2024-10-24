#!/bin/bash

set -e

function help {
  echo "Available commands:"
  echo "  backup [<backup-file>] - Backup the database to a file"
  echo "  restore <backup-file> <dbname> - Restore the database from a file"
  exit 1
}

[ $# -eq 0 ] && help

cmd=$1

case $cmd in
  backup)
    shift
    (
      #check if backup file name is provided
      BACKUP_FILE=$1
      if [ -z "$1" ]; then
        echo "Backup file not provided. Using default file name"
        BACKUP_FILE="backup-$(date +%Y-%m-%d-%H-%M-%S).dump"
      fi

      if [ -z "$BACKUP_ZIP_PASSWORD" ]; then
        echo "Backup zip password not provided"
        exit 1
      fi

      echo "Creating ${BACKUP_FILE} backup file ..."
      export PGPASSWORD=$DATABASE_PASSWORD
      pg_dump -w -Fc -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER" "$DATABASE_NAME" \
        | zip -q --password "$BACKUP_ZIP_PASSWORD" > /backups/"$BACKUP_FILE"
      echo "Backup completed."
    )
    ;;
  restore)
    shift
    (
      #check if backup file name is provided
      BACKUP_FILE=$1
      if [ -z "$1" ]; then
        echo "Backup file not provided"
        exit 1
      fi

      DB_NAME=$2
      if [ -z "$2" ]; then
        echo "Database name not provided"
        exit 1
      fi

      if [ -z "$BACKUP_ZIP_PASSWORD" ]; then
        echo "Backup zip password not provided"
        exit 1
      fi

      echo "Restoring ${BACKUP_FILE} backup file into ${DB_NAME} database ..."
      export PGPASSWORD=$DATABASE_PASSWORD

      # restore from backup file
      createdb -w -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER" "${DB_NAME}-temp" \
        &&
      unzip -p -P "$BACKUP_ZIP_PASSWORD" /restore/"$BACKUP_FILE" \
        | pg_restore -w -x -O --clean --if-exists -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER" --role "$DATABASE_USER" -d "${DB_NAME}-temp"

      if [ $? -eq 0 ]; then
        # Drop the original database
        dropdb -w -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER" "$DB_NAME" &&\
        psql -w -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER" -d postgres -c "ALTER DATABASE \"${DB_NAME}-temp\" RENAME TO \"$DB_NAME\";"
      else
        echo "Restore failed."
        exit 1
      fi

      if [ $? -eq 0 ]; then
        echo "Restore completed."
      else
        echo "Restore failed."
        exit 1
      fi
    )
    ;;
  help)
    help
    ;;
  *)
    echo "Invalid command $cmd"
    help
    ;;
esac
