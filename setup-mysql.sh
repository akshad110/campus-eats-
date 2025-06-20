#!/bin/bash

# MySQL Setup Script for CampusEats
echo "🗄️ Setting up MySQL for CampusEats..."

# Install MySQL if not present
if ! command -v mysql &> /dev/null; then
    echo "📦 Installing MySQL..."
    sudo apt update
    sudo apt install -y mysql-server
fi

# Start MySQL service
echo "▶️ Starting MySQL service..."
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation (optional)
echo "🔒 Running MySQL secure installation..."
echo "Please follow the prompts to secure your MySQL installation"
sudo mysql_secure_installation

# Create database and user
echo "🏗️ Creating CampusEats database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS campuseats;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'campuseats'@'localhost' IDENTIFIED BY 'campuseats123';"
sudo mysql -e "GRANT ALL PRIVILEGES ON campuseats.* TO 'campuseats'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

echo "✅ MySQL setup complete!"
echo "📋 Database: campuseats"
echo "👤 User: campuseats"
echo "🔑 Password: campuseats123"
echo ""
echo "🚀 Now you can run: npm run dev:full"
