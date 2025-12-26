#  Wallet Service with Paystack, JWT & API Keys

A comprehensive digital wallet service built with NestJS, featuring Paystack payment integration, Google OAuth authentication, and API key management for service-to-service communication.

## Features

### Authentication & Authorization
- **Google OAuth 2.0** - Seamless social authentication
- **JWT Authentication** - Secure token-based auth
- **API Key Management** - Generate and manage API keys with granular permissions
- **Composite Auth Guard** - Support both JWT and API key authentication

### Wallet Operations
- **Deposits** - Integrate with Paystack for card payments
- **Transfers** - Send money between wallets
- **Balance Inquiry** - Check wallet balance
- **Transaction History** - View detailed transaction records with filtering

### API Key Features
- Generate up to 5 active API keys per user
- Granular permissions: `read`, `deposit`, `transfer`
- Time-based expiry (1H, 1D, 1M, 1Y)
- Key rollover for expired keys
- Secure hashing with Argon2

### Security Features
- Rate limiting with throttler
- Encrypted API keys (Argon2)
- Webhook signature verification
- Permission-based access control
- CORS configuration

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- pnpm (v10 or higher)
- Paystack account (test/live keys)
- Google OAuth credentials

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Chinweike99/paystack_wallet_service.git
cd paystack_wallet_service
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup environment variables

Create a `.env` file in the root directory:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=wallet_service

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_CALLBACK_URL=http://localhost:4000/wallet/deposit/callback
PAYSTACK_WEBHOOK_URL=http://localhost:4000/wallet/paystack/webhook
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1d

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 4. Setup database

```bash
# Create database
createdb wallet_service

# Run migrations (if available) or let TypeORM sync
# The database schema will be auto-created on first run
```

### 5. Run the application

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

The application will be available at:
- API: `http://localhost:4000`
- Swagger UI: `http://localhost:4000/api`

## API Documentation

Once the application is running, visit `http://localhost:4000/api` for interactive API documentation powered by Swagger.

### Main Endpoints

#### Authentication
```
GET  /auth/google              - Initiate Google OAuth
GET  /auth/google/callback     - Google OAuth callback
POST /auth/refresh             - Refresh JWT token
POST /auth/validate            - Validate JWT token
```

#### Wallet Operations
```
POST /wallet/deposit           - Initialize deposit
GET  /wallet/deposit/callback  - Paystack callback
GET  /wallet/balance           - Get wallet balance
POST /wallet/transfer          - Transfer funds
GET  /wallet/transactions      - Get transaction history
GET  /wallet/details           - Get wallet details
```

#### API Key Management
```
POST   /keys/create    - Create new API key
POST   /keys/rollover  - Rollover expired key
GET    /keys           - List all API keys
DELETE /keys/:id       - Revoke API key
```

## Authentication

### Option 1: JWT Token (User Authentication)

1. Authenticate via Google OAuth:
```bash
GET /auth/google
```

2. Use the returned JWT token in requests:
```bash
Authorization: Bearer <your_jwt_token>
```

### Option 2: API Key (Service-to-Service)

1. Create an API key:
```bash
POST /keys/create
{
  "name": "My Service Key",
  "permissions": ["read", "deposit", "transfer"],
  "expiry": "1M"
}
```

2. Use the API key in requests:
```bash
x-api-key: sk_live_...
```

## Testing Deposits with Paystack

### Test Card Details

Use these test cards in Paystack's test mode:

**Successful Payment:**
- Card Number: `4084 0840 8408 4081`
- CVV: `408`
- Expiry: Any future date
- PIN: `1234`
- OTP: `123456`

**Failed Payment (Insufficient Funds):**
- Card Number: `5060 6666 6666 6666 666`

### Deposit Flow

1. Initialize deposit:
```bash
POST /wallet/deposit
{
  "amount": 5000
}
```

2. Use the `authorization_url` to complete payment

3. After payment, you'll be redirected to the callback URL and wallet will be credited

##  Database Schema

### Users
- id, email, firstName, lastName, picture
- isActive, createdAt, updatedAt

### Wallets
- id, walletNumber (13 digits), balance, currency
- userId (FK), createdAt, updatedAt

### Transactions
- id, type (deposit/transfer), amount, status
- reference, userId (FK), walletId (FK)
- metadata, createdAt, updatedAt

### API Keys
- id, name, key (hashed), permissions
- isActive, expiresAt, lastUsedAt
- userId (FK), createdAt, updatedAt

## Security Features

- **Password Hashing**: API keys hashed with Argon2
- **Rate Limiting**: 100 requests per minute per IP
- **CORS**: Configured for specific origins
- **Webhook Verification**: Paystack signature validation
- **Permission System**: Granular access control
- **Transaction Limits**: Daily transfer limit of 1,000,000 NGN

## Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## Project Structure

```
src/
├── api-key/              # API key management
│   ├── decorators/       # Permission decorators
│   ├── dto/             # Data transfer objects
│   └── guards/          # API key guards
├── auth/                # Authentication
│   ├── decorators/      # Public decorator
│   └── strategy/        # JWT & Google OAuth strategies
├── config/              # Configuration management
├── database/            # Database module & config
├── entities/            # TypeORM entities
├── wallets/             # Wallet operations
│   ├── dto/            # Wallet DTOs
│   └── services/       # Paystack service
└── common/             # Shared utilities
    └── pipes/          # Zod validation pipe
```

## Deployment

### Environment Variables for Production

Ensure you update these for production:
- Change `NODE_ENV` to `production`
- Use production Paystack keys (`sk_live_...`)
- Set strong `JWT_SECRET`
- Configure production database
- Set proper `FRONTEND_URL` and callback URLs

### Database Migrations

Before deploying, ensure database is properly set up:
```bash
# Sync schema (development only)
# TypeORM will auto-sync on start

# For production, consider using migrations
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the UNLICENSED License.

## Author

**Chinweike Akwolu**
- GitHub: [@Chinweike99](https://github.com/Chinweike99)

## Acknowledgments

- [NestJS](https://nestjs.com/) - The progressive Node.js framework
- [Paystack](https://paystack.com/) - Payment processing
- [TypeORM](https://typeorm.io/) - Database ORM
- [Zod](https://zod.dev/) - TypeScript-first schema validation

---
