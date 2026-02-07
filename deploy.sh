#!/bin/bash
set -e

echo "🚀 Deploying Good Open Box — goodobox.com"
echo "==========================================="

# Build frontend
echo ""
echo "📦 Building frontend..."
cd "$(dirname "$0")/frontend"
npm ci
npm run build
echo "✅ Frontend built → dist/"

# Install backend deps
echo ""
echo "📦 Installing backend dependencies..."
cd ../backend
npm ci --omit=dev

# Check for .env
if [ ! -f .env ]; then
  echo ""
  echo "⚠️  No .env file found in backend/"
  echo "   Copy .env.example to .env and set your JWT_SECRET"
  echo "   cp .env.example .env"
  exit 1
fi

echo ""
echo "✅ Deploy ready!"
echo ""
echo "To start the server:"
echo "  cd backend && NODE_ENV=production node server.js"
echo ""
echo "The server will serve both the API and frontend on port \${PORT:-5000}"
echo "Point your domain goodobox.com to this server's IP"
