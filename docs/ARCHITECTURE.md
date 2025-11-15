# Architecture Overview

## System Architecture

The Investment Platform is built as a full-stack application with the following components:

### Frontend
- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **State Management**: React Query, Zustand
- **Authentication**: JWT tokens stored in cookies

### Backend
- **Framework**: Node.js with Express
- **Database**: PostgreSQL with Sequelize ORM
- **Caching**: Redis
- **Authentication**: JWT
- **Email**: Nodemailer (configurable for production services)

### Infrastructure
- **Containerization**: Docker
- **Reverse Proxy**: Nginx
- **Database**: PostgreSQL
- **Cache**: Redis

## Data Flow

### Authentication Flow
1. User signs up → Backend creates user → Sends OTP email
2. User verifies email → Backend marks email as verified
3. User logs in → Backend validates credentials → Returns JWT token
4. Frontend stores token → Includes in API requests

### Payment Flow
1. User initiates deposit/withdrawal → Backend creates transaction
2. Backend calls PSP API → Gets payment URL
3. User completes payment → PSP sends webhook
4. Backend processes webhook → Updates transaction and wallet balance

### KYC Flow
1. User initiates KYC → Backend creates KYC record
2. Backend calls KYC provider API → Gets verification URL
3. User completes verification → KYC provider sends webhook
4. Backend processes webhook → Updates KYC status

## Database Schema

### Core Tables
- `users`: User accounts
- `profiles`: User profile information
- `kyc_records`: KYC verification records
- `wallets`: User wallets
- `transactions`: Payment transactions
- `products`: Investment products
- `portfolios`: User investment portfolios

### Relationships
- User → Profile (1:1)
- User → KYC (1:1)
- User → Wallet (1:1)
- User → Transactions (1:many)
- User → Portfolios (1:many)
- Product → Portfolios (1:many)
- Wallet → Transactions (1:many)

## Security

### Authentication & Authorization
- JWT tokens for API authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Email verification required

### Data Protection
- Input validation on all endpoints
- SQL injection prevention via ORM
- XSS protection via React
- CSRF protection
- Rate limiting on API endpoints

### API Security
- Helmet.js for security headers
- CORS configuration
- Request size limits
- Error message sanitization

## Integration Points

### KYC Provider
- REST API integration
- Webhook handling for status updates
- Stubbed in M1, fully integrated in M2

### Payment Service Provider (PSP)
- REST API integration
- Webhook handling for transaction updates
- Account creation and management
- Deposit and withdrawal processing

### Email Service
- Configurable email provider
- OTP delivery
- Magic link delivery
- Password reset emails

## Scalability Considerations

### Horizontal Scaling
- Stateless backend services
- Load balancer ready
- Database connection pooling
- Redis for session/cache management

### Performance
- Database indexing on frequently queried fields
- API response caching where appropriate
- Efficient database queries
- CDN for static assets (frontend)

## Monitoring & Logging

### Logging
- Winston for structured logging
- Log levels: error, warn, info, debug
- Log rotation and archival

### Monitoring
- Health check endpoints
- Error tracking (Sentry ready)
- Performance monitoring
- Database query monitoring

## Development Workflow

### Local Development
1. Start services with Docker Compose
2. Backend runs on port 5000
3. Frontend runs on port 3000
4. Hot reload enabled for both

### Testing
- Unit tests for backend services
- Integration tests for API endpoints
- E2E tests for critical flows

### Deployment
- Docker-based deployment
- Environment-based configuration
- Database migrations
- Zero-downtime deployment ready

