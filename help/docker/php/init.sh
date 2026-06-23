#!/bin/sh
set -e

# Copy code from slow Windows mount to fast native Linux filesystem (first time only)
# To force re-copy after code changes, run: docker compose restart phpfpm nginx
# Or delete the marker: docker exec crmeb_php rm /var/www_native/.version
if [ -f /var/www_native/.version ]; then
    echo "Native code already exists, skipping copy."
else
    echo "Copying code to native filesystem (this may take 2-3 minutes)..."
    cp -r /var/www_mount/. /var/www_native/
    echo "Code copy complete."
fi

# Always fix runtime permissions (needed for www-data to write cache/logs/sessions)
chown -R www-data:www-data /var/www_native/runtime
chmod -R 777 /var/www_native/backup /var/www_native/public
chmod 666 /var/www_native/.env /var/www_native/.version /var/www_native/.constant

# Install OPcache if not already loaded
if ! php -m | grep -q opcache; then
    docker-php-ext-install opcache >/dev/null 2>&1 || true
    echo "OPcache installed."
fi

exec "$@"
