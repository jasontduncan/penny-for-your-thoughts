# Penny For Your Thoughts Micro-blog

This is a micro-blogging app that stores author's micro-blogs, or 'thoughts', on the blockchain. The content is, therefore, resistant to tampering and censorship.

## Usage

### Prerequisites for deployment:

`$OWNER` environment variable must be set to an account you control  
`$NEAR_ENV` environment variable must be set to either `testnet` or `mainnet`

### Testnet:

1. clone this repo to a local folder
2. run `yarn`
3. run `yarn test`
4. run `./scripts/1.deploy.sh`

### Scripts:

1. `1.deploy.sh` deletes any existing account under `$CONTRACT.$OWNER` and calls `dev-deploy`.
2. `2.shareThought.sh` posts a new thought to `$CONTRACT` with identity `$OWNER`. Will fail if $OWNER doesn't own `$CONTRACT`.
  - eg. `./scripts/2.shareThought.sh "Here's a thought..."`
3. `3.readThoughts.sh` returns all thoughts posted to the specified contract.
  - eg. `./scripts/3.readThoughts.sh dev-xxxxxxxx-xxxxxxx`
4. `4.givePenny.sh` transfers the specified amount of Near from the `$OWNER` to the `$CONTRACT`
  - eg. `./scripts4.givePenny.sh 2`
