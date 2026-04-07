#!/bin/sh
set -e

# 1. Reach the root
cd ../../../../../

# 2. Clean up
rm -f config.xml
rm -rf www
rm -rf public

# 3. Build web assets
npm install
npm run build

# 4. Sync and install Native Pods
npx cap sync ios

# Move into the iOS folder relative to the ROOT
cd ios/App
pod install
