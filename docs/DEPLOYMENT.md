# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- PostgreSQL (or use Docker)
- Redis (or use Docker)

## Environment Setup

### Backend Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=investment_platform

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email Service
EMAIL_SERVICE_API_KEY=your-email-service-api-key
EMAIL_FROM=noreply@yourdomain.com

# KYC Provider
KYC_API_KEY=your-kyc-api-key
KYC_API_URL=https://api.kyc-provider.com
KYC_WEBHOOK_SECRET=your-kyc-webhook-secret

# PSP/Custodian
PSP_API_KEY=your-psp-api-key
PSP_API_SECRET=your-psp-api-secret
PSP_API_URL=https://api.psp-provider.com
PSP_WEBHOOK_SECRET=your-psp-webhook-secret
PRIMARY_CURRENCY=AED

# Redis
REDIS_URL=redis://redis:6379

# Application URLs
APP_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

### Frontend Environment Variables

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Docker Deployment

### 1. Build and Start Services

```bash
docker-compose up -d
```

### 2. Run Database Migrations

```bash
docker-compose exec backend npm run migrate
```

### 3. Seed Initial Data (Optional)

```bash
docker-compose exec backend npm run seed
```

### 4. Verify Services

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## Production Deployment

### 1. Update Docker Compose for Production

Update `docker-compose.yml` with:
- Production environment variables
- SSL certificates
- Resource limits
- Health checks

### 2. Set Up Reverse Proxy

Configure Nginx or similar reverse proxy with SSL certificates.

### 3. Database Backups

Set up automated database backups:

```bash
# Backup script
docker-compose exec postgres pg_dump -U postgres investment_platform > backup.sql
```

### 4. Monitoring

- Set up application monitoring (e.g., Sentry)
- Configure log aggregation
- Set up uptime monitoring

### 5. Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable firewall rules
- [ ] Regular security updates
- [ ] Database encryption at rest
- [ ] Secure webhook endpoints

## Scaling

### Horizontal Scaling

1. Scale backend services:
```bash
docker-compose up -d --scale backend=3
```

2. Use load balancer (Nginx) to distribute traffic

3. Scale frontend:
```bash
docker-compose up -d --scale frontend=2
```

### Database Scaling

- Consider read replicas for read-heavy workloads
- Implement connection pooling
- Monitor query performance

## Maintenance

### Logs

View logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Updates

1. Pull latest code
2. Rebuild images:
```bash
docker-compose build
docker-compose up -d
```

3. Run migrations if needed:
```bash
docker-compose exec backend npm run migrate
```

### Backup and Restore

**Backup:**
```bash
docker-compose exec postgres pg_dump -U postgres investment_platform > backup_$(date +%Y%m%d).sql
```

**Restore:**
```bash
docker-compose exec -T postgres psql -U postgres investment_platform < backup_20240101.sql
```

## Troubleshooting

### Database Connection Issues

Check database is running:
```bash
docker-compose ps postgres
```

Check connection:
```bash
docker-compose exec backend npm run migrate
```

### Port Conflicts

If ports are already in use, update `docker-compose.yml` port mappings.

### Memory Issues

Increase Docker memory limits or optimize application.

## Support

For issues, check:
1. Application logs
2. Database logs
3. Nginx logs
4. System resources

