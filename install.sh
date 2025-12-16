#!/bin/bash
set -euo pipefail

REPO="1337hero/focustype-app"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}==>${NC} $1"; }
success() { echo -e "${GREEN}==>${NC} $1"; }
error() { echo -e "${RED}error:${NC} $1" >&2; exit 1; }

# Detect architecture
ARCH=$(uname -m)
case "$ARCH" in
  x86_64) ARCH="amd64" ;;
  aarch64) ARCH="arm64" ;;
  *) error "Unsupported architecture: $ARCH" ;;
esac

# Detect OS
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
[[ "$OS" != "linux" ]] && error "This installer only supports Linux"

info "Fetching latest release..."
LATEST=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | grep '"tag_name"' | cut -d'"' -f4)
VERSION="${LATEST#v}"

info "Installing FocusType $VERSION for $OS-$ARCH"

# Download AppImage
URL="https://github.com/$REPO/releases/download/$LATEST/focustype_${VERSION}_${ARCH}.AppImage"
TMPFILE=$(mktemp)
trap "rm -f $TMPFILE" EXIT

info "Downloading from $URL..."
curl -fsSL "$URL" -o "$TMPFILE" || error "Download failed"

# Install
mkdir -p "$INSTALL_DIR"
mv "$TMPFILE" "$INSTALL_DIR/focustype"
chmod +x "$INSTALL_DIR/focustype"

success "FocusType installed to $INSTALL_DIR/focustype"

# Check PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
  echo ""
  echo "Add to your shell config:"
  echo "  export PATH=\"\$PATH:$INSTALL_DIR\""
fi
