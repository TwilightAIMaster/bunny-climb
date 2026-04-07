set -e
cd ../../../..
# The command below is what you need:
rm -f ios/App/App.xcworkspace/xcshareddata/swiftpm/Package.resolved
npm install
npx cap sync ios
