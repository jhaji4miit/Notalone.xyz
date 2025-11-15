# Getting Started Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Node.js** (version 18 or higher) - for local development
- **npm** or **yarn** - package manager

## Quick Start (5 minutes)

### 1. Clone and Setup

```bash
# Navigate to project directory
cd investment-platform

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Configure Environment Variables

#### Backend Configuration

Create `backend/.env` file with the following content:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=investment_platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (for OTP/Magic Links)
EMAIL_SERVICE_API_KEY=your-email-service-api-key
EMAIL_FROM=noreply@investmentplatform.com
EMAIL_SERVICE_URL=https://api.emailservice.com

# KYC/AML Provider Configuration (Stubbed for M1)
KYC_API_KEY=your-kyc-api-key
KYC_API_URL=https://api.kyc-provider.com
KYC_WEBHOOK_SECRET=your-kyc-webhook-secret

# Payment Service Provider (PSP/Custodian) Configuration
PSP_API_KEY=your-psp-api-key
PSP_API_SECRET=your-psp-api-secret
PSP_API_URL=https://api.psp-provider.com
PSP_WEBHOOK_SECRET=your-psp-webhook-secret
PRIMARY_CURRENCY=AED

# Redis Configuration
REDIS_URL=redis://redis:6379

# Application URLs
APP_URL=http://localhost:3000
API_URL=http://localhost:5000/api

# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_API_KEY=your-analytics-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

#### Frontend Configuration

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Services

```bash
# Start all services with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps
```

### 4. Initialize Database

```bash
# Run database migrations
docker-compose exec backend npm run migrate

# Seed initial data (optional - creates admin user and sample products)
docker-compose exec backend npm run seed
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

### 6. Default Admin Credentials

After running the seed script:
- **Email**: admin@investmentplatform.com
- **Password**: admin123

⚠️ **Important**: Change the admin password immediately in production!

## Development Workflow

### Running Services Locally (without Docker)

#### Backend

```bash
cd backend
npm install
npm run dev
```

Backend will run on http://localhost:5000

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:3000

### Viewing Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# All logs
docker-compose logs -f
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

## Testing the Application

### 1. User Registration Flow

1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Enter email and optional password
4. Check console/logs for OTP (in development mode)
5. Enter OTP to verify email
6. Login with credentials

### 2. Magic Link Login

1. Go to login page
2. Click "Use magic link instead"
3. Enter email
4. Check console/logs for magic link (in development mode)
5. Use the link to login

### 3. Profile Setup

1. Login to dashboard
2. Navigate to profile
3. Fill in profile information
4. Accept risk disclosure

### 4. KYC Process

1. Navigate to KYC section
2. Click "Initiate KYC"
3. In M1, this is stubbed and will return mock responses

### 5. Wallet & Payments

1. Navigate to wallet
2. Initiate deposit (stubbed in development)
3. View transaction history

### 6. Product Discovery

1. Browse products page
2. Filter by category, risk level
3. View product details
4. Invest in a product (requires wallet balance)

### 7. Portfolio Tracking

1. View portfolio page
2. See investment summary
3. Track individual investments

### 8. Admin Panel

1. Login as admin
2. Access admin dashboard
3. View statistics
4. Manage KYC records
5. Manage products

## Common Issues & Solutions

### Port Already in Use

If ports 3000, 5000, or 5432 are already in use:

1. Update `docker-compose.yml` port mappings
2. Or stop the conflicting service

### Database Connection Error

```bash
# Check if PostgreSQL container is running
docker-compose ps postgres

# Restart database
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

### Frontend Can't Connect to Backend

1. Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
2. Check backend is running: http://localhost:5000/health
3. Check CORS settings in backend

### Email Not Sending

In development mode, emails are logged to console. For production:
1. Configure email service in `backend/.env`
2. Update email service credentials

## Next Steps

1. **Review Documentation**
   - Read `PROJECT_SUMMARY.md` for overview
   - Check `docs/API.md` for API details
   - Review `docs/ARCHITECTURE.md` for system design

2. **Configure Integrations**
   - Set up email service for production
   - Configure KYC provider (M2)
   - Configure PSP provider

3. **Customize**
   - Update branding and styling
   - Add custom products
   - Configure business rules

4. **Deploy**
   - Follow `docs/DEPLOYMENT.md`
   - Set up production environment
   - Configure monitoring

## Getting Help

- Check documentation in `docs/` directory
- Review code comments
- Check logs for error messages
- Review API documentation

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload in development
2. **Database Changes**: Use migrations for schema changes
3. **Testing**: Run tests before committing changes
4. **Logging**: Check logs directory for detailed logs
5. **Environment**: Use `.env` files for configuration, never commit secrets

## Production Readiness Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Use strong JWT secret
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure email service
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Review security settings
- [ ] Test all integrations
- [ ] Load testing
- [ ] Security audit

Happy coding! 🚀

