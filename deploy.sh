#!/bin/bash

echo "🚀 Starting EducateNext Production Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create SSL directory if it doesn't exist
mkdir -p ssl

# Generate self-signed SSL certificate if not exists
if [ ! -f ssl/cert.pem ]; then
    echo "🔐 Generating SSL certificate..."
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
fi

# Build and start services
echo "🏗️ Building and starting services..."
docker-compose down
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
curl -f http://localhost:5001/health || echo "⚠️ Backend health check failed"

echo "✅ Deployment completed!"
echo "🌐 Frontend: https://localhost"
echo "🔧 Backend API: https://localhost/api"
echo "📊 Health Check: https://localhost/api/health"