#!/bin/bash

# Script to create a zip archive of the project

ARCHIVE_NAME="investment-platform-$(date +%Y%m%d-%H%M%S).zip"

echo "Creating archive: $ARCHIVE_NAME"

# Create archive excluding node_modules, .next, and other build artifacts
zip -r "$ARCHIVE_NAME" . \
    -x "node_modules/*" \
    -x "*/node_modules/*" \
    -x ".next/*" \
    -x "*/.next/*" \
    -x "*.log" \
    -x "logs/*" \
    -x "*.zip" \
    -x ".git/*" \
    -x "*.sqlite" \
    -x "*.db" \
    -x ".DS_Store" \
    -x "coverage/*" \
    -x ".nyc_output/*"

echo "Archive created: $ARCHIVE_NAME"
echo "Size: $(du -h "$ARCHIVE_NAME" | cut -f1)"

