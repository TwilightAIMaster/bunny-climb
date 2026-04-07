#!/bin/sh
set -e

# 1. Reach the root (Updated for the App/App path)
cd ../../../../../

# 2. Clean up
rm -f config.xml
rm -rf www
rm -rf public

# 3. Build
npm install
npm run build

# 4. Sync
npx cap sync ios

