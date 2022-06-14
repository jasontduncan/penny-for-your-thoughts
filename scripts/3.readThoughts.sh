#!/usr/bin/env bash
set -e

[ -z "$OWNER" ] && echo "\$OWNER environment variable not set." && exit 1
[ -z "$1" ] && echo "Account ID can't be blank." && exit 1

echo
echo "Fetching thoughts..."
echo
near call $1 readThoughts  --account-id=$OWNER
echo
echo "Done."
