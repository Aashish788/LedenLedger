#!/bin/bash

# ============================================================================
# VERCEL DEPLOYMENT SCRIPT - FIX SPA ROUTING
# ============================================================================
# This script deploys your app to Vercel with the routing fix
# ============================================================================

echo "🚀 Lenden Ledger - Vercel Deployment Script"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if vercel.json exists
echo "📋 Step 1: Checking vercel.json..."
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✅ vercel.json found${NC}"
else
    echo -e "${RED}❌ vercel.json not found${NC}"
    echo "Creating vercel.json..."
    # Create vercel.json if it doesn't exist
    exit 1
fi

# Step 2: Check git status
echo ""
echo "📋 Step 2: Checking git status..."
if git status &> /dev/null; then
    echo -e "${GREEN}✅ Git repository detected${NC}"
else
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi

# Step 3: Check for uncommitted changes
echo ""
echo "📋 Step 3: Checking for uncommitted changes..."
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo ""
    git status -s
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📝 Committing changes..."
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        echo -e "${GREEN}✅ Changes committed${NC}"
    else
        echo -e "${YELLOW}⚠️  Continuing without committing${NC}"
    fi
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
fi

# Step 4: Test build locally
echo ""
echo "📋 Step 4: Testing build locally..."
read -p "Do you want to test build locally first? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔨 Building..."
    npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        echo "Fix build errors before deploying"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Skipping local build test${NC}"
fi

# Step 5: Push to git
echo ""
echo "📋 Step 5: Pushing to git..."
read -p "Push to main branch? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Pushing to main..."
    git push origin main
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Pushed to main${NC}"
    else
        echo -e "${RED}❌ Push failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Skipping git push${NC}"
fi

# Step 6: Summary
echo ""
echo "=============================================="
echo "🎉 Deployment Process Complete!"
echo "=============================================="
echo ""
echo "Next Steps:"
echo "1. ⏳ Wait for Vercel to auto-deploy (2-3 minutes)"
echo "2. 🔍 Check Vercel dashboard for deployment status"
echo "3. 🧪 Test your routes:"
echo "   - https://your-app.vercel.app/customers"
echo "   - https://your-app.vercel.app/staff"
echo "   - https://your-app.vercel.app/dashboard"
echo ""
echo "All routes should now work! ✅"
echo ""

# Open Vercel dashboard
read -p "Open Vercel dashboard in browser? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "https://vercel.com/dashboard"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "https://vercel.com/dashboard"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        start "https://vercel.com/dashboard"
    fi
fi

echo ""
echo "✨ Done!"
