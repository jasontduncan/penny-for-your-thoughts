#!/usr/bin/env bash

[ -z "$CONTRACT" ] && echo "\$CONTRACT environment variable not set"
[ -z "$OWNER" ] && echo "\$OWNER environment variable not set"

echo "Deleting old contract, if it exists..."
near delete $CONTRACT.$OWNER $OWNER
echo "Done."

echo "Rebuilding..."
rm -rf ./neardev
set -e
yarn build:release
near dev-deploy --accountId $CONTRACT.$OWNER --wasmFile ./build/release/cert_demo.wasm --initFunction new --initArgs "{\"thinker\": \"$OWNER\"}"
echo "Done."


echo
echo
echo "Update the \$CONTRACT environment variable:"
echo "export CONTRACT=dev-xxxxxxxxxxx-xxxxxxxxx listed as 'Account id:', above"
echo
echo
echo "Then try: ./scripts/2.shareThough.sh \"Whatever's on your mind\""
echo
echo

