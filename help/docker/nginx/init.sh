#!/bin/sh
set -e

# Wait for phpfpm to finish copying the code to the shared volume
echo "Waiting for code sync from phpfpm..."
while [ ! -f /var/www_native/.version ]; do
    sleep 1
done
echo "Code ready."

exec "$@"
