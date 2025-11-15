# Investment Platform Website

A production-ready investment platform website with user onboarding (KYC-ready), funding flows, product discovery, portfolio tracking, and admin operations.

## Features

- **User Authentication**: Sign up, login, password reset with email OTP/magic link
- **Role-Based Access**: End-User and Admin roles
- **Profile Management**: User profiles with KYC/AML readiness
- **Payment Integration**: PSP/Custodian integration for deposits/withdrawals
- **Product Discovery**: Browse and discover investment products
- **Portfolio Tracking**: Track investments and portfolio performance
- **Admin Panel**: Basic admin operations
- **Analytics & SEO**: Built-in analytics and SEO optimization
- **Accessibility**: WCAG compliant
- **DevOps**: Docker setup with monitoring

## Project Structure

```
├── backend/          # Node.js/Express API
├── frontend/         # Next.js React application
├── database/         # Database migrations and schema
├── docker/           # Docker configurations
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### Installation

1. Clone the repository
2. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

3. Start with Docker:
   ```bash
   docker-compose up -d
   ```

4. Run migrations:
   ```bash
   cd backend && npm run migrate
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:3000/admin

## Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See `.env.example` files in backend and frontend directories for required environment variables.

## Documentation

See `/docs` directory for detailed documentation:
- API Documentation
- Deployment Guide
- Architecture Overview
- KYC Integration Guide

## License

Proprietary - All rights reserved

