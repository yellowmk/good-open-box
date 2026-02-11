#!/bin/bash
# Good Open Box iOS - Project Setup
# Run this on a Mac with Xcode 15+ installed
#
# Option 1: Use XcodeGen (recommended)
#   brew install xcodegen
#   cd GoodOpenBoxApp && xcodegen generate && cd ..
#   cd GoodOpenBoxDriver && xcodegen generate && cd ..
#
# Option 2: Create projects via Xcode
#   1. Open Xcode → File → New → Project → iOS App (SwiftUI)
#   2. Set product name to "GoodOpenBoxApp", bundle ID "com.goodopenbox.marketplace"
#   3. Move generated .xcodeproj into this ios/ directory
#   4. Delete generated source files, point to existing Sources/ directory
#   5. Add local package dependency: Packages/GOBShared
#   6. Repeat for GoodOpenBoxDriver with bundle ID "com.goodopenbox.driver"
#
# Option 3: Use the included .xcodeproj files
#   The .xcodeproj files included may need regeneration on your Mac.
#   Open the workspace and let Xcode resolve packages.

set -e

echo "=== Good Open Box iOS Setup ==="

# Check for XcodeGen
if command -v xcodegen &> /dev/null; then
    echo "XcodeGen found, generating projects..."

    cd "$(dirname "$0")"

    echo "Generating GoodOpenBoxApp..."
    cd GoodOpenBoxApp
    xcodegen generate
    cd ..

    echo "Generating GoodOpenBoxDriver..."
    cd GoodOpenBoxDriver
    xcodegen generate
    cd ..

    echo "Done! Open GoodOpenBox.xcworkspace in Xcode."
else
    echo "XcodeGen not found."
    echo "Install with: brew install xcodegen"
    echo ""
    echo "Or open the included .xcodeproj files directly:"
    echo "  open GoodOpenBox.xcworkspace"
    echo ""
    echo "You may need to:"
    echo "  1. Add source files to each target's Build Phases"
    echo "  2. Resolve the GOBShared package dependency"
fi
