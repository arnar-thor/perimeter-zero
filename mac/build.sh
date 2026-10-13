#!/usr/bin/env bash
# Build Perimeter Zero for macOS (arm64 + x64, unsigned) and a Linux x64 copy used only for testing.
set -euo pipefail
cd "$(dirname "$0")"
# Prerequisites: Node 20+, `npm ci` in this folder (Electron + @electron/packager), zip, and rcodesign
# (run ./fetch-rcodesign.sh once, or set RCODESIGN=/path/to/rcodesign).
RC=${RCODESIGN:-$PWD/tools/rcodesign}
[ -x "$RC" ] || { echo "rcodesign not found: run ./fetch-rcodesign.sh or set RCODESIGN" >&2; exit 1; }
[ -d node_modules/electron ] || npm ci
EV=$(node -p "require('electron/package.json').version")
rm -rf out && mkdir -p out dist
common=(app --name "Perimeter Zero" --app-version 1.0.0 --build-version 1.0.0
  --app-bundle-id net.norselabs.perimeterzero --app-category-type public.app-category.developer-tools
  --app-copyright "© 2026 Norselabs" --icon build/icon.icns --asar --electron-version "$EV" --out out --overwrite --prune=true)
npx @electron/packager "${common[@]}" --platform darwin --arch arm64,x64 --darwin-dark-mode-support --executable-name "Perimeter Zero"
npx @electron/packager "${common[@]}" --platform linux --arch x64 --executable-name perimeter-zero
cd out
# Ad-hoc signature (no Apple identity) so Apple Silicon doesn't reject the modified Electron binaries as "damaged".
for a in arm64 x64; do "$RC" sign "Perimeter Zero-darwin-$a/Perimeter Zero.app" >/dev/null 2>../rcodesign-$a.log || { echo "rcodesign failed ($a)"; tail -5 ../rcodesign-$a.log; exit 1; }; done
for a in arm64 x64; do
  z="../dist/Perimeter-Zero-1.0.0-mac-$a.zip"; rm -f "$z"
  (cd "Perimeter Zero-darwin-$a" && zip -qry -X "../$z" "Perimeter Zero.app")
done
cd ../dist
# Split the arm64 zip into <=60 MB parts for transfer (reassemble with: cat pz-arm64.part* > Perimeter-Zero-1.0.0-mac-arm64.zip)
rm -f pz-arm64.part*
split -b 60000000 -d -a 2 Perimeter-Zero-1.0.0-mac-arm64.zip pz-arm64.part
sha256sum *.zip pz-arm64.part* > SHA256SUMS.txt && cat SHA256SUMS.txt && ls -la
