#!/usr/bin/env bash
set -e

[ -z "$CONTRACT" ] && echo "\$CONTRACT environment variable not set." && exit 1
[ -z "$OWNER" ] && echo "\$OWNER environment variable not set." && exit 1
[ -z "$1" ] && echo "Thought text can't be blank" && exit 1

near call $CONTRACT shareThought "{\"thought\": \"$1\"}" --account-id $OWNER --deposit $2
