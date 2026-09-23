#!/bin/sh
set -eu

# Only VITE_* variables are intended for the browser. jq safely escapes values.
config=$(jq -cn 'env | with_entries(select(.key | startswith("VITE_")))')
printf 'window.__APP_CONFIG__ = %s;\n' "$config" > /tmp/runtime-config.js.tmp
mv /tmp/runtime-config.js.tmp /tmp/runtime-config.js

exec "$@"
