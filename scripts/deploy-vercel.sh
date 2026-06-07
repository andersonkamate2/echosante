#!/bin/bash
# Deploy to Vercel with environment configuration

set -e

echo "🚀 Echo Santé - Vercel Deployment Script"
echo "========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📦 Building locally first..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Local build successful!"
    echo ""
    echo "🌐 Deploying to Vercel..."
    echo ""
    echo "Choose deployment type:"
    echo "1) Production deployment (--prod)"
    echo "2) Preview deployment"
    read -p "Select (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        echo "📤 Deploying to PRODUCTION..."
        vercel --prod
    else
        echo "📤 Deploying PREVIEW version..."
        vercel
    fi
else
    echo "❌ Build failed. Fix errors and try again."
    exit 1
fi
