#!/bin/bash

# EducateNext Setup Script
# This script will set up the entire EducateNext application

echo "🚀 EducateNext Setup Script"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js v18 or higher."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Check if MongoDB is running
check_mongodb() {
    print_status "Checking MongoDB connection..."
    if command -v mongosh &> /dev/null; then
        if mongosh --eval "db.runCommand('ping')" &> /dev/null; then
            print_success "MongoDB is running"
        else
            print_warning "MongoDB is not running. Please start MongoDB before running the application."
        fi
    else
        print_warning "MongoDB client not found. Please ensure MongoDB is installed and running."
    fi
}

# Install backend dependencies
setup_backend() {
    print_status "Setting up backend..."
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating backend .env file..."
        cp env.example .env
        print_success "Backend .env file created. Please configure it with your settings."
    else
        print_success "Backend .env file already exists."
    fi
    
    cd ..
}

# Install frontend dependencies
setup_frontend() {
    print_status "Setting up frontend..."
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating frontend .env file..."
        cp env.example .env
        print_success "Frontend .env file created. Please configure it with your settings."
    else
        print_success "Frontend .env file already exists."
    fi
    
    cd ..
}

# Install mobile app dependencies
setup_mobile() {
    print_status "Setting up mobile applications..."
    
    # Teacher app
    if [ -d "mobile/teacher-app" ]; then
        cd mobile/teacher-app
        print_status "Installing teacher app dependencies..."
        npm install
        cd ../..
    fi
    
    # Student app
    if [ -d "mobile/student-app" ]; then
        cd mobile/student-app
        print_status "Installing student app dependencies..."
        npm install
        cd ../..
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    # Backend uploads directory
    mkdir -p backend/uploads
    mkdir -p backend/logs
    
    # Frontend build directory
    mkdir -p frontend/dist
    
    print_success "Directories created successfully."
}

# Build the application
build_application() {
    print_status "Building the application..."
    
    # Build backend
    cd backend
    print_status "Building backend..."
    npm run build
    cd ..
    
    # Build frontend
    cd frontend
    print_status "Building frontend..."
    npm run build
    cd ..
    
    print_success "Application built successfully."
}

# Display setup completion message
show_completion() {
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    echo "Next steps:"
    echo "1. Configure your environment files:"
    echo "   - backend/.env"
    echo "   - frontend/.env"
    echo ""
    echo "2. Start the application:"
    echo "   # Terminal 1 - Backend"
    echo "   cd backend && npm run dev"
    echo ""
    echo "   # Terminal 2 - Frontend"
    echo "   cd frontend && npm run dev"
    echo ""
    echo "3. Access the application:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:5000/api"
    echo "   - Health Check: http://localhost:5000/health"
    echo ""
    echo "4. For mobile apps:"
    echo "   cd mobile/teacher-app && npm start"
    echo "   cd mobile/student-app && npm start"
    echo ""
    echo "📚 Documentation: README.md"
    echo "🐛 Issues: Create an issue in the repository"
    echo ""
}

# Main setup function
main() {
    echo "Starting EducateNext setup..."
    echo ""
    
    # Run checks
    check_node
    check_npm
    check_mongodb
    
    echo ""
    
    # Setup components
    setup_backend
    setup_frontend
    setup_mobile
    
    echo ""
    
    # Create directories
    create_directories
    
    echo ""
    
    # Build application
    build_application
    
    echo ""
    
    # Show completion message
    show_completion
}

# Run the setup
main
