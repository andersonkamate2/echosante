#!/bin/bash
# Interactive Vercel environment setup script

set -e

echo ""
echo "======================================"
echo "🚀 Echo Santé - Vercel Setup Wizard"
echo "======================================"
echo ""

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found."
    echo "Install with: npm install -g vercel"
    exit 1
fi

echo "Select deployment strategy:"
echo ""
echo "1️⃣  Supabase PostgreSQL (⭐ Recommended)"
echo "   - Persistent data"
echo "   - Free tier 500MB"
echo "   - Production-ready"
echo ""
echo "2️⃣  SQLite (For testing only)"
echo "   - No persistence"
echo "   - Zero cost"
echo "   - Data lost on redeploy"
echo ""
read -p "Choose (1 or 2): " STRATEGY

echo ""

if [ "$STRATEGY" = "1" ]; then
    echo "📋 Supabase Configuration"
    echo "=========================="
    echo ""
    echo "Get your Supabase credentials from:"
    echo "→ https://app.supabase.com/project/_/settings/api"
    echo ""
    echo "You'll need:"
    echo "• Project URL (NEXT_PUBLIC_SUPABASE_URL)"
    echo "• Anon Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)"  
    echo "• Service Role Secret (SUPABASE_SERVICE_KEY)"
    echo "• Pooler Connection (DATABASE_URL) - port 6543"
    echo "• Direct Connection (DIRECT_URL) - port 5432"
    echo ""
    read -p "Press Enter when ready to configure..."
    echo ""
    
    # Set up environment variables
    echo "Setting up Vercel environment variables..."
    echo ""
    
    echo "Enter DATABASE_URL (pooler - port 6543):"
    read -s DATABASE_URL
    vercel env add DATABASE_URL --plaintext <<< "$DATABASE_URL"
    echo "✅ DATABASE_URL set"
    
    echo "Enter DIRECT_URL (direct - port 5432):"
    read -s DIRECT_URL
    vercel env add DIRECT_URL --plaintext <<< "$DIRECT_URL"
    echo "✅ DIRECT_URL set"
    
    echo "Enter NEXT_PUBLIC_SUPABASE_URL:"
    read SUPABASE_URL
    vercel env add NEXT_PUBLIC_SUPABASE_URL --plaintext <<< "$SUPABASE_URL"
    echo "✅ NEXT_PUBLIC_SUPABASE_URL set"
    
    echo "Enter NEXT_PUBLIC_SUPABASE_ANON_KEY:"
    read -s ANON_KEY
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY --plaintext <<< "$ANON_KEY"
    echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY set"
    
    echo "Enter SUPABASE_ANON_KEY (same as above):"
    read -s SUPABASE_ANON_KEY
    vercel env add SUPABASE_ANON_KEY --plaintext <<< "$SUPABASE_ANON_KEY"
    echo "✅ SUPABASE_ANON_KEY set"
    
    echo "Enter SUPABASE_SERVICE_KEY:"
    read -s SERVICE_KEY
    vercel env add SUPABASE_SERVICE_KEY --plaintext <<< "$SERVICE_KEY"
    echo "✅ SUPABASE_SERVICE_KEY set"
    
    echo "Enter SITE_URL (e.g., https://echo-sante.vercel.app):"
    read SITE_URL
    vercel env add SITE_URL --plaintext <<< "$SITE_URL"
    echo "✅ SITE_URL set"
    
    echo "Generating AUTH_COOKIE_SECRET..."
    AUTH_SECRET=$(openssl rand -base64 32)
    vercel env add AUTH_COOKIE_SECRET --plaintext <<< "$AUTH_SECRET"
    echo "✅ AUTH_COOKIE_SECRET generated"
    
    vercel env add SUPABASE_STORAGE_BUCKET --plaintext <<< "echosante"
    echo "✅ SUPABASE_STORAGE_BUCKET set"

elif [ "$STRATEGY" = "2" ]; then
    echo "📋 SQLite Configuration"
    echo "======================="
    echo ""
    echo "⚠️  WARNING: SQLite on Vercel has NO persistence!"
    echo "    Data will be lost on redeploy."
    echo ""
    read -p "Continue? (y/n): " -n 1 CONFIRM
    echo ""
    
    if [ "$CONFIRM" != "y" ]; then
        echo "Aborted."
        exit 1
    fi
    
    echo "Setting up SQLite environment variables..."
    echo ""
    
    vercel env add DATABASE_URL --plaintext <<< "file:/tmp/data.db"
    echo "✅ DATABASE_URL set (SQLite)"
    
    vercel env add DIRECT_URL --plaintext <<< "file:/tmp/data.db"
    echo "✅ DIRECT_URL set"
    
    echo "Enter SITE_URL (e.g., https://echo-sante.vercel.app):"
    read SITE_URL
    vercel env add SITE_URL --plaintext <<< "$SITE_URL"
    echo "✅ SITE_URL set"
    
    vercel env add DEBUG --plaintext <<< "false"
    echo "✅ DEBUG set to false"
    
    echo "Generating AUTH_COOKIE_SECRET..."
    AUTH_SECRET=$(openssl rand -base64 32)
    vercel env add AUTH_COOKIE_SECRET --plaintext <<< "$AUTH_SECRET"
    echo "✅ AUTH_COOKIE_SECRET generated"

else
    echo "❌ Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "======================================"
echo "✅ Environment configuration complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Run: npm run build"
echo "2. Run: vercel --prod"
echo ""
echo "For more info, see: DEPLOYMENT_COMPLETE.md"
echo ""
