#!/bin/sh
set -e

# 1. Move to the project root
cd ../../../..

# 2. Install dependencies
npm install

# 3. Ensure the 'public' folder exists so the build doesn't crash
mkdir -p public

# 4. Sync the web assets to the iOS project
npx cap sync ios

