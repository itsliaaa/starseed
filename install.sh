#!/usr/bin/env bash
set -e

echo "🚀 Updating system..."
sudo apt update -y && sudo apt upgrade -y

echo "📦 Installing required packages..."
sudo apt install -y ffmpeg git curl

echo "🟢 Installing NVM (if not exists)..."
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
source ~/.bashrc

echo "⚡ Installing Node.js 24 LTS..."
nvm install 24
nvm alias default 24
nvm use default

echo "📦 Enabling Corepack..."
corepack enable
corepack prepare yarn@stable --activate

echo "📥 Installing dependencies with Yarn..."
yarn install 2>/dev/null

echo "🚀 Installing PM2 globally..."
npm install -g pm2

echo "✅ Install complete! You can start now, or configure config.js first."