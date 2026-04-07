#!/bin/sh
set -e

# 0. Copy export options plists to workspace-level ci/ directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="${CI_PRIMARY_REPOSITORY_PATH:-$(cd "$SCRIPT_DIR/../../../.." && pwd)}"
WORKSPACE_CI="${CI_WORKSPACE:-/Volumes/workspace}/ci"
mkdir -p "$WORKSPACE_CI"
cp "$REPO_ROOT/ci/development-exportoptions.plist" "$WORKSPACE_CI/"
cp "$REPO_ROOT/ci/ad-hoc-exportoptions.plist" "$WORKSPACE_CI/"

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
#

# 5. Native install
cd ios/App
pod install
#



