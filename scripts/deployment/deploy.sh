#!/bin/bash

# Configuration
PROJECT_DIR="/home/ubuntu/PSY-Q" # <--- Update if project folder is different
APP_NAME="psyq-backend"

echo "🚀 Starting Deployment..."

cd $PROJECT_DIR

# 1. Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# 2. Setup Backend
echo "📦 Installing Backend dependencies..."
cd backend
npm install
echo "🔄 Restarting Backend with PM2..."
pm2 restart $APP_NAME || pm2 start server.js --name "$APP_NAME"

# 3. Setup Frontend
echo "📦 Installing Frontend dependencies..."
cd ..
npm install
echo "🏗️ Building Frontend..."
npm run build

echo "✨ Deployment Complete! Your site is now updated."
pm2 list
