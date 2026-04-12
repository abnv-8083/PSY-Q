#!/bin/bash

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx

# Setup firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow 22

echo "✅ EC2 Setup Complete! Node.js, PM2, and Nginx are installed."
echo "Next: Configure your .env files and set up Nginx."
