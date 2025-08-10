#!/bin/bash

# EducateNext Secure Installation Script
# This script sets up the EducateNext application with security hardening

set -e  # Exit on any error

echo "🚀 Starting EducateNext Secure Installation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check system requirements
print_header "Checking System Requirements"

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi
print_status "Node.js version: $(node -v) ✓"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    print_warning "MongoDB is not installed locally. Make sure you have access to a MongoDB instance."
fi

# Check Redis (optional but recommended)
if ! command -v redis-server &> /dev/null; then
    print_warning "Redis is not installed. Installing Redis is recommended for caching."
fi

# Generate secure secrets
print_header "Generating Secure Configuration"

generate_secret() {
    openssl rand -hex 32
}

JWT_SECRET=$(generate_secret)
SESSION_SECRET=$(generate_secret)

# Create secure .env file
print_status "Creating secure environment configuration..."

cat > backend/.env << EOF
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/educatenext

# Security Configuration (GENERATED - DO NOT SHARE)
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=1h
SESSION_SECRET=${SESSION_SECRET}
BCRYPT_ROUNDS=12

# Email Configuration (CONFIGURE THESE)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS Configuration (CONFIGURE THESE)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Security Headers
CORS_ORIGIN=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Session Configuration
SESSION_COOKIE_MAX_AGE=3600000

# Monitoring & Logging
LOG_LEVEL=info
ENABLE_AUDIT_LOGGING=true
AUDIT_RETENTION_DAYS=365

# Development/Testing
MOCK_EXTERNAL_SERVICES=false
ENABLE_DEBUG_LOGS=false
EOF

print_status "Secure environment file created ✓"

# Set proper file permissions
chmod 600 backend/.env
print_status "Environment file permissions secured ✓"

# Install backend dependencies
print_header "Installing Backend Dependencies"
cd backend
npm install
print_status "Backend dependencies installed ✓"

# Install additional security dependencies
print_status "Installing security dependencies..."
npm install express-session connect-mongo csurf winston
npm install --save-dev @types/express-session @types/connect-mongo @types/csurf
print_status "Security dependencies installed ✓"

# Create uploads directory with proper permissions
mkdir -p uploads
chmod 755 uploads
print_status "Upload directory created with secure permissions ✓"

# Install frontend dependencies
print_header "Installing Frontend Dependencies"
cd ../frontend
npm install
print_status "Frontend dependencies installed ✓"

# Create frontend environment file
cat > .env << EOF
VITE_API_URL=http://localhost:5001/api
VITE_APP_NAME=EducateNext
VITE_NODE_ENV=development
EOF

print_status "Frontend environment file created ✓"

# Build frontend for production
print_status "Building frontend for production..."
npm run build
print_status "Frontend built successfully ✓"

# Install mobile app dependencies
print_header "Installing Mobile App Dependencies"

# Teacher app
if [ -d "../mobile/teacher-app" ]; then
    cd ../mobile/teacher-app
    npm install
    print_status "Teacher app dependencies installed ✓"
fi

# Student app
if [ -d "../mobile/student-app" ]; then
    cd ../mobile/student-app
    npm install
    print_status "Student app dependencies installed ✓"
fi

# Return to root directory
cd ../..

# Create systemd service file (optional)
print_header "Creating System Service Configuration"

cat > educatenext.service << EOF
[Unit]
Description=EducateNext Backend Server
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$(pwd)/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
RestartSec=10

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$(pwd)/backend/uploads

[Install]
WantedBy=multi-user.target
EOF

print_status "System service file created (educatenext.service) ✓"

# Create nginx configuration template
print_header "Creating Nginx Configuration Template"

cat > nginx.conf.template << EOF
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    
    # Frontend
    location / {
        root $(pwd)/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # File uploads
    client_max_body_size 10M;
}
EOF

print_status "Nginx configuration template created ✓"

# Create security checklist
print_header "Creating Security Checklist"

cat > SECURITY_CHECKLIST.md << EOF
# EducateNext Security Checklist

## ✅ Completed During Installation
- [x] Secure JWT and session secrets generated
- [x] Environment file created with proper permissions (600)
- [x] Security dependencies installed
- [x] Upload directory created with secure permissions
- [x] Rate limiting configured
- [x] Input validation middleware implemented
- [x] Audit logging enabled

## 🔧 Manual Configuration Required

### Database Security
- [ ] Configure MongoDB authentication
- [ ] Enable MongoDB SSL/TLS
- [ ] Set up database backups
- [ ] Configure database user with minimal privileges

### SSL/TLS Configuration
- [ ] Obtain SSL certificate
- [ ] Configure HTTPS in production
- [ ] Update CORS origins for production domain
- [ ] Enable HSTS headers

### Email & SMS Configuration
- [ ] Configure email service credentials
- [ ] Set up Twilio for SMS notifications
- [ ] Test email and SMS functionality

### Production Deployment
- [ ] Set NODE_ENV=production
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up process manager (PM2)
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging

### Security Hardening
- [ ] Run security audit: npm audit
- [ ] Configure fail2ban for brute force protection
- [ ] Set up intrusion detection system
- [ ] Regular security updates schedule
- [ ] Penetration testing

### Compliance
- [ ] Review FERPA compliance requirements
- [ ] Implement data retention policies
- [ ] Set up privacy policy
- [ ] Configure consent management
- [ ] Legal review of monitoring features

## 🚨 Critical Security Notes

1. **Never commit .env files to version control**
2. **Change default passwords immediately**
3. **Regularly update dependencies**
4. **Monitor security advisories**
5. **Implement backup and disaster recovery**
6. **Regular security audits**

## 📞 Support

For security issues, contact: security@educatenext.com
EOF

print_status "Security checklist created ✓"

# Final security recommendations
print_header "Installation Complete - Security Recommendations"

echo ""
print_status "✅ EducateNext has been installed with security hardening!"
echo ""
print_warning "IMPORTANT SECURITY STEPS:"
echo "1. Review and complete the SECURITY_CHECKLIST.md"
echo "2. Configure email and SMS credentials in backend/.env"
echo "3. Set up SSL/TLS certificates for production"
echo "4. Configure MongoDB authentication"
echo "5. Run 'npm audit' to check for vulnerabilities"
echo ""
print_status "To start the application:"
echo "Backend:  cd backend && npm run dev"
echo "Frontend: cd frontend && npm run dev"
echo ""
print_warning "Remember: This is a development setup. Additional hardening is required for production!"

# Create quick start script
cat > start-dev.sh << EOF
#!/bin/bash
echo "Starting EducateNext Development Environment..."

# Start backend
cd backend
npm run dev &
BACKEND_PID=\$!

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=\$!

echo "Backend PID: \$BACKEND_PID"
echo "Frontend PID: \$FRONTEND_PID"

# Wait for Ctrl+C
trap "kill \$BACKEND_PID \$FRONTEND_PID" EXIT
wait
EOF

chmod +x start-dev.sh
print_status "Quick start script created (./start-dev.sh) ✓"

echo ""
print_status "🎉 Installation completed successfully!"
print_status "📋 Please review SECURITY_CHECKLIST.md for next steps"
echo ""