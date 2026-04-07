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

# 4. Sync and FIX: Patch the CocoaPods bug for Xcode 16+
npx cap sync ios
find ios/App/Pods -name "Pods-App-frameworks.sh" -exec sed -i '' 's/readlink "${source}"/readlink -f "${source}"/g' {} +

# 5. Native install
cd ios/App
pod install

