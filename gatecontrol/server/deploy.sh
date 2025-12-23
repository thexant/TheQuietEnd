#!/bin/bash
# The Quiet End - Multiplayer Server Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on error

echo "========================================="
echo "The Quiet End - Multiplayer Server Setup"
echo "========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js 18+ first"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    exit 1
fi

echo "✓ npm found: $(npm --version)"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "✗ Failed to install dependencies"
    exit 1
fi

# Check if PM2 is installed
echo ""
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found. Installing PM2 globally..."
    sudo npm install -g pm2
    if [ $? -eq 0 ]; then
        echo "✓ PM2 installed successfully"
    else
        echo "✗ Failed to install PM2"
        exit 1
    fi
else
    echo "✓ PM2 found: $(pm2 --version)"
fi

# Ask if user wants to start the server
echo ""
read -p "Start server with PM2? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Stop existing instance if running
    pm2 delete tqe-multiplayer 2>/dev/null || true

    # Start server
    echo "Starting server..."
    pm2 start server.js --name tqe-multiplayer

    if [ $? -eq 0 ]; then
        echo "✓ Server started successfully"

        # Save PM2 configuration
        pm2 save

        # Show status
        echo ""
        pm2 status

        # Ask about startup script
        echo ""
        read -p "Enable auto-start on system boot? (y/n) " -n 1 -r
        echo ""

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo ""
            echo "Run the following command to enable auto-start:"
            echo ""
            pm2 startup
            echo ""
            echo "Then follow the instructions above."
        fi
    else
        echo "✗ Failed to start server"
        exit 1
    fi
fi

echo ""
echo "========================================="
echo "Setup complete!"
echo "========================================="
echo ""
echo "Server is running on ws://localhost:8080"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check server status"
echo "  pm2 logs tqe-multiplayer - View server logs"
echo "  pm2 restart tqe-multiplayer - Restart server"
echo "  pm2 stop tqe-multiplayer - Stop server"
echo ""
echo "Next steps:"
echo "1. Configure nginx reverse proxy (see README.md)"
echo "2. Set up SSL certificate with Let's Encrypt"
echo "3. Upload game files to web root"
echo "4. Test connection from browser"
echo ""
