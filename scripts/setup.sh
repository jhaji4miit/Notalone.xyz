#!/bin/bash

# Setup script for Investment Platform

echo "Setting up Investment Platform..."

# Create logs directory
mkdir -p backend/logs

# Copy environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env from example..."
    cp backend/.env.example backend/.env 2>/dev/null || echo "Please create backend/.env manually"
fi

if [ ! -f frontend/.env.local ]; then
    echo "Creating frontend/.env.local from example..."
    cp frontend/.env.example frontend/.env.local 2>/dev/null || echo "Please create frontend/.env.local manually"
fi

# Install dependencies
echo "Installing root dependencies..."
npm install

echo "Installing backend dependencies..."
cd backend && npm install && cd ..

echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure backend/.env with your settings"
echo "2. Configure frontend/.env.local with your settings"
echo "3. Start services: docker-compose up -d"
echo "4. Run migrations: cd backend && npm run migrate"
echo "5. Seed data (optional): cd backend && npm run seed"

