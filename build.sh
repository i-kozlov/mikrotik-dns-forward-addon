#!/bin/bash

# Build script for MikroTik DNS Forward extension

DIST_DIR="dist"
BUILD_DATE=$(date '+%Y-%m-%d %H:%M:%S')
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# Common files
FILES="background.js utils.js popup options icons"

# Chrome build
echo "Building Chrome extension..."
mkdir -p "$DIST_DIR/chrome"
cp manifest.json "$DIST_DIR/chrome/"
for f in $FILES; do cp -r "$f" "$DIST_DIR/chrome/"; done
sed -i '' "s/__BUILD_DATE__/$BUILD_DATE/g" "$DIST_DIR/chrome/options/options.html"
(cd "$DIST_DIR/chrome" && zip -r ../mikrotik-dns-forward-chrome.zip .)
echo "Created: $DIST_DIR/mikrotik-dns-forward-chrome.zip"

# Firefox build
echo "Building Firefox extension..."
mkdir -p "$DIST_DIR/firefox"
cp manifest.firefox.json "$DIST_DIR/firefox/manifest.json"
for f in $FILES; do cp -r "$f" "$DIST_DIR/firefox/"; done
sed -i '' "s/__BUILD_DATE__/$BUILD_DATE/g" "$DIST_DIR/firefox/options/options.html"
(cd "$DIST_DIR/firefox" && zip -r ../mikrotik-dns-forward-firefox.xpi .)
echo "Created: $DIST_DIR/mikrotik-dns-forward-firefox.xpi"

echo "Build date: $BUILD_DATE"
echo "Done!"
