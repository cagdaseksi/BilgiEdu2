#!/bin/bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"
TASK="${1:-archive}"
VERSION="$(node -p "require('./package.json').version")"
BUILD_NUMBER="${IOS_BUILD_NUMBER:-2}"
if [[ ! "$BUILD_NUMBER" =~ ^[1-9][0-9]*$ ]]; then
  echo 'IOS_BUILD_NUMBER must be a positive integer.' >&2
  exit 1
fi
ARCHIVE_PATH="${IOS_ARCHIVE_PATH:-$PROJECT_ROOT/build/testflight/arrow-$VERSION-$BUILD_NUMBER.xcarchive}"

if [[ "$TASK" == 'verify' ]]; then
  python3 scripts/verify-ios-archive.py "$ARCHIVE_PATH"
  exit 0
fi
if [[ "$TASK" != 'archive' && "$TASK" != 'export' ]]; then
  echo 'Usage: ios-testflight.sh archive|export|verify' >&2
  exit 1
fi
if [[ ! "${IOS_TEAM_ID:-}" =~ ^[A-Z0-9]{10}$ ]]; then
  echo 'Set IOS_TEAM_ID to your Apple Developer Team ID. Example: IOS_TEAM_ID=YBV5NARZ4A npm run ios:archive' >&2
  exit 1
fi
if [[ ! -d ios/Pods ]]; then
  echo 'Run bundle exec pod install from ios/ first.' >&2
  exit 1
fi
mkdir -p "$PROJECT_ROOT/build/testflight"

if [[ "$TASK" == 'archive' ]]; then
  if [[ -e "$ARCHIVE_PATH" ]]; then
    echo "Archive already exists: $ARCHIVE_PATH. Use a new IOS_BUILD_NUMBER or IOS_ARCHIVE_PATH." >&2
    exit 1
  fi
  xcodebuild archive \
    -workspace ios/BilgiEdu2.xcworkspace \
    -scheme BilgiEdu2 \
    -configuration Release \
    -destination 'generic/platform=iOS' \
    -archivePath "$ARCHIVE_PATH" \
    -derivedDataPath build/testflight/DerivedData \
    -allowProvisioningUpdates \
    "DEVELOPMENT_TEAM=$IOS_TEAM_ID" \
    CODE_SIGN_STYLE=Automatic \
    "MARKETING_VERSION=$VERSION" \
    "CURRENT_PROJECT_VERSION=$BUILD_NUMBER"
  python3 scripts/verify-ios-archive.py "$ARCHIVE_PATH"
  exit 0
fi

python3 scripts/verify-ios-archive.py "$ARCHIVE_PATH"
EXPORT_PATH="$PROJECT_ROOT/build/testflight/export-$VERSION-$BUILD_NUMBER"
EXPORT_OPTIONS="$PROJECT_ROOT/build/testflight/ExportOptions-$VERSION-$BUILD_NUMBER.plist"
export IOS_EXPORT_OPTIONS="$EXPORT_OPTIONS"
python3 - <<'PY'
import os, plistlib
options = {
    'method': 'app-store-connect',
    'destination': 'export',
    'teamID': os.environ['IOS_TEAM_ID'],
    'signingStyle': 'automatic',
    'manageAppVersionAndBuildNumber': False,
    'testFlightInternalTestingOnly': False,
    'uploadSymbols': True,
}
with open(os.environ['IOS_EXPORT_OPTIONS'], 'wb') as f:
    plistlib.dump(options, f)
PY
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS" \
  -allowProvisioningUpdates
printf 'Exported App Store Connect package to %s\n' "$EXPORT_PATH"
printf 'Export does not upload the app or invite testers.\n'
