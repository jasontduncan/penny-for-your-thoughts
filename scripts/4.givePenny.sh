#!/usr/bin/env bash
set -e

[ -z "$CONTRACT" ] && echo "$CONTRACT environment variable not set." && exit 1
[ -z "$OWNER" ] && echo "$OWNER environment variable not set." && exit 1
[ -z "$1" ] && echo "Value can't be blank." && exit 1

near call $CONTRACT givePenny --deposit $1
