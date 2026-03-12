#!/usr/bin/env bash
set -e

OS="$(uname -s)"

echo "🔎 Detected OS: $OS"

install_node_nvm() {
   echo "🟢 Installing NVM (if not exists)..."
   if [ ! -d "$HOME/.nvm" ]; then
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
   fi

   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

   echo "⚡ Installing Node.js 24 LTS..."
   nvm install 24
   nvm alias default 24
   nvm use default
}

install_common_tools() {
   echo "📦 Enabling Corepack..."
   corepack enable
   corepack prepare yarn@1.22.22 --activate

   echo "📥 Installing dependencies..."
   yarn install 2>/dev/null

   echo "🚀 Installing PM2 globally..."
   npm install -g pm2
}

case "$OS" in

Linux)
   if [ -n "$PREFIX" ] && [[ "$PREFIX" == *"com.termux"* ]]; then
      echo "📱 Android (Termux) detected"

      pkg update -y
      pkg upgrade -y
      pkg install -y nodejs-lts ffmpeg git curl

      echo "⚡ Using built-in nodejs-lts (no NVM on Termux)"

      install_common_tools
   else
      echo "🐧 Linux detected"

      sudo apt update -y
      sudo apt upgrade -y
      sudo apt install -y ffmpeg git curl

      install_node_nvm
      install_common_tools
   fi
   ;;

Darwin)
   echo "🍎 macOS detected"

   if ! command -v brew >/dev/null 2>&1; then
      echo "❌ Homebrew not found. Install from https://brew.sh first."
      exit 1
   fi

   brew update
   brew install ffmpeg git curl

   install_node_nvm
   install_common_tools
   ;;

*)
   echo "❌ Unsupported OS for this script."
   exit 1
   ;;

esac

echo "✅ Install complete!"