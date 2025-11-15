# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/signup
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123" // optional
}
```

**Response:**
```json
{
  "message": "User created successfully. Please verify your email with the OTP sent.",
  "userId": "uuid"
}
```

#### POST /auth/verify-email
Verify email with OTP.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "end_user",
    "emailVerified": true
  }
}
```

#### POST /auth/magic-link
Request magic link for passwordless login.

**Request:**
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/verify-magic-link
Verify magic link token.

**Request:**
```json
{
  "email": "user@example.com",
  "token": "magic-link-token"
}
```

#### POST /auth/forgot-password
Request password reset.

**Request:**
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password
Reset password with token.

**Request:**
```json
{
  "email": "user@example.com",
  "token": "reset-token",
  "password": "newpassword123"
}
```

#### GET /auth/me
Get current authenticated user.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "end_user",
    "emailVerified": true
  }
}
```

### Profile

#### GET /profile
Get user profile.

#### PUT /profile
Update user profile.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "country": "AE",
  "residency": "AE",
  "phoneNumber": "+971501234567",
  "dateOfBirth": "1990-01-01"
}
```

#### POST /profile/accept-risk-disclosure
Accept risk disclosure.

### KYC

#### POST /kyc/initiate
Initiate KYC process.

#### GET /kyc/status
Get KYC status.

**Response:**
```json
{
  "status": "pending|in_progress|approved|rejected|expired",
  "providerReference": "reference-id",
  "submittedAt": "2024-01-01T00:00:00Z"
}
```

### Wallet

#### GET /wallet
Get wallet information.

#### GET /wallet/balance
Get wallet balance.

**Response:**
```json
{
  "balance": 1000.00,
  "currency": "AED"
}
```

#### GET /wallet/transactions
Get transaction history.

**Query Parameters:**
- `limit` (optional): Number of records (default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `type` (optional): Filter by type (deposit, withdrawal, investment, etc.)

### Payments

#### POST /payments/deposit
Initiate deposit.

**Request:**
```json
{
  "amount": 1000.00,
  "currency": "AED"
}
```

**Response:**
```json
{
  "message": "Deposit initiated",
  "transaction": {
    "id": "uuid",
    "amount": 1000.00,
    "currency": "AED",
    "status": "pending",
    "redirectUrl": "https://payment-gateway.com/..."
  }
}
```

#### POST /payments/withdraw
Initiate withdrawal.

**Request:**
```json
{
  "amount": 500.00,
  "currency": "AED",
  "destination": "bank-account-id"
}
```

#### GET /payments/transaction/:id
Get transaction status.

### Products

#### GET /products
Get all products (public).

**Query Parameters:**
- `category` (optional): Filter by category
- `riskLevel` (optional): Filter by risk level (low, medium, high)
- `minAmount` (optional): Minimum investment amount
- `maxAmount` (optional): Maximum investment amount
- `search` (optional): Search in name and description
- `limit` (optional): Number of records (default: 20)
- `offset` (optional): Offset for pagination (default: 0)

#### GET /products/:id
Get product by ID (public).

### Portfolio

#### GET /portfolio
Get user portfolio.

**Response:**
```json
{
  "portfolios": [...],
  "summary": {
    "totalInvestments": 5,
    "totalValue": 50000.00,
    "currency": "AED"
  }
}
```

#### POST /portfolio/invest
Invest in a product.

**Request:**
```json
{
  "productId": "uuid",
  "amount": 10000.00
}
```

### Admin

All admin endpoints require admin role.

#### GET /admin/dashboard
Get admin dashboard statistics.

#### GET /admin/kyc
Get all KYC records.

#### PUT /admin/kyc/:id
Update KYC status.

**Request:**
```json
{
  "status": "approved|rejected",
  "rejectionReason": "Reason if rejected"
}
```

### Webhooks

#### POST /webhooks/psp
PSP webhook endpoint.

#### POST /webhooks/kyc
KYC provider webhook endpoint.

