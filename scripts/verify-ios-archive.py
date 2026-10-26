#!/usr/bin/env python3
"""Validate the local iOS Release archive without contacting Apple."""
import json
import pathlib
import plistlib
import subprocess
import sys

archive = pathlib.Path(sys.argv[1]).resolve()
app = archive / 'Products/Applications/BilgiEdu2.app'
if not app.is_dir():
    raise SystemExit(f'App missing from archive: {app}')
with (app / 'Info.plist').open('rb') as f:
    info = plistlib.load(f)
checks = {
    'bundle_id': info.get('CFBundleIdentifier') == json.loads(pathlib.Path('distribution/testflight/beta-info.json').read_text())['bundleId'],
    'version': info.get('CFBundleShortVersionString') == json.loads(pathlib.Path('package.json').read_text())['version'],
    'build_number': str(info.get('CFBundleVersion', '')).isdigit(),
    'display_name': info.get('CFBundleDisplayName') == 'arrow.',
    'embedded_javascript': (app / 'main.jsbundle').is_file() and (app / 'main.jsbundle').stat().st_size > 100_000,
    'app_icon': (app / 'Assets.car').is_file() and bool(info.get('CFBundleIcons', {}).get('CFBundlePrimaryIcon')),
    'privacy_manifest': (app / 'PrivacyInfo.xcprivacy').is_file(),
    'export_compliance': info.get('ITSAppUsesNonExemptEncryption') is False,
    'device_build': info.get('CFBundleSupportedPlatforms') == ['iPhoneOS'],
    'debug_symbols': (archive / 'dSYMs/BilgiEdu2.app.dSYM').is_dir(),
}
signature = subprocess.run(['codesign', '--verify', '--deep', '--strict', str(app)], capture_output=True, text=True)
checks['code_signature'] = signature.returncode == 0
if signature.returncode:
    print(signature.stderr, file=sys.stderr)
for name, passed in checks.items():
    print(f'{"PASS" if passed else "FAIL"}: {name}')
if not all(checks.values()):
    raise SystemExit('Archive validation failed.')
print(f'Validated signed device archive: {archive}')
print('This does not verify App Store Connect processing or TestFlight approval.')
