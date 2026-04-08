#!/bin/sh
set -e

# 0. Copy export options plists to workspace-level ci/ directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="${CI_PRIMARY_REPOSITORY_PATH:-$(cd "$SCRIPT_DIR/../../../.." && pwd)}"
WORKSPACE_CI="${CI_WORKSPACE:-/Volumes/workspace}/ci"
mkdir -p "$WORKSPACE_CI"
cp "$REPO_ROOT/ci/app-store-exportoptions.plist" "$WORKSPACE_CI/"
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

# 6. Pre-resolve Swift Package dependencies with retry to avoid Xcode Cloud download timeouts
MAX_ATTEMPTS=5
ATTEMPT=1
until xcodebuild -resolvePackageDependencies \
    -workspace App.xcworkspace \
    -scheme App \
    -clonedSourcePackagesDirPath "$WORKSPACE_CI/SourcePackages" 2>&1; do
  if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    echo "Failed to resolve package dependencies after $MAX_ATTEMPTS attempts."
    exit 1
  fi
  echo "Package resolution attempt $ATTEMPT failed. Retrying in 15 seconds..."
  ATTEMPT=$((ATTEMPT + 1))
  sleep 15
done
echo "Swift Package dependencies resolved successfully."



