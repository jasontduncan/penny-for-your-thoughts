#!/usr/bin/env bash
set -e

[ -z "$OWNER" ] && echo "\$OWNER environment variable not set." && exit 1
[ -z "$1" ] && echo "Contract ID can't be blank." && exit 1

count=${2:-10}
skip=${3:-0}

echo
echo "Fetching thoughts..."
echo
near call $1 readThoughts "{\"count\": $count, \"skip\": $skip}" --account-id=$OWNER
echo
echo "Done."
