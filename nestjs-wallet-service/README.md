# NestJS Wallet Service

A production-ready wallet service API built with NestJS, TypeScript, and PostgreSQL. This service provides secure wallet management, fund transfers, and transaction tracking with idempotency support.

## Features

- **Wallet Management**: Create wallets with multi-currency support (USD, EUR, NGN)
- **Fund Operations**: Add funds to wallets with validation
- **Transfers**: Secure peer-to-peer wallet transfers with atomic transactions
- **Transaction History**: Complete audit trail of all wallet activities
- **Idempotency**: Prevent duplicate transactions with optional idempotency keys
- **Validation**: Comprehensive input validation and error handling
- **Database Transactions**: ACID-compliant transfers using database transactions
- **Auto-generated References**: Unique transaction references for tracking

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Assumptions](#assumptions)
- [Production Scaling Considerations](#production-scaling-considerations)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher) - `npm install -g pnpm`
- **PostgreSQL** (v15 or higher) OR Docker
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Chinweike99/nestjs-wallet-service.git
cd nestjs-wallet-service
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Database

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Verify database is running
docker ps
```

#### Option B: Using Local PostgreSQL

```bash
# Create database
psql -U postgres
CREATE DATABASE wallet_db;
CREATE USER wallet_user WITH PASSWORD 'wallet_password';
GRANT ALL PRIVILEGES ON DATABASE wallet_db TO wallet_user;
\q
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Server
PORT=4000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=wallet_user
DB_PASSWORD=wallet_password
DB_NAME=wallet_db
```

**Note**: The `.env` file is already configured with default values. You can use it as-is for local development.

## Running the Application

### Development Mode (with hot-reload)

```bash
pnpm run start:dev
```

The API will be available at: `http://localhost:4000`

### Production Mode

```bash
# Build the application
pnpm run build

# Start production server
pnpm run start:prod
```

### Debug Mode

```bash
pnpm run start:debug
```

## API Endpoints

### Base URL
```
http://localhost:4000
```

### 1. Create Wallet

**POST** `/wallets`

**Request Body:**
```json
{
  "currency": "USD" 
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "currency": "USD",
  "balance": "0.00",
  "createdAt": "2025-12-15T10:30:00.000Z",
  "updatedAt": "2025-12-15T10:30:00.000Z"
}
```

### 2. Fund Wallet

**POST** `/wallets/fund`

**Request Body:**
```json
{
  "walletId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 1000.00,
  "description": "Initial deposit",  // Optional
  "idempotencyKey": "fund-2025-12-15-abc123"  // Optional (for duplicate prevention)
}
```

**Response:**
```json
{
  "wallet": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "currency": "USD",
    "balance": "1000.00"
  },
  "reference": "TXN-1702617600000-A3B7C9D",
  "idempotencyKey": "fund-2025-12-15-abc123"
}
```

### 3. Transfer Funds

**POST** `/wallets/transfer`

**Request Body:**
```json
{
  "senderWalletId": "550e8400-e29b-41d4-a716-446655440000",
  "receiverWalletId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "amount": 250.00,
  "description": "Payment for services",  // Optional
  "idempotencyKey": "transfer-2025-12-15-xyz789"  // Optional
}
```

**Response:**
```json
{
  "sender": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "currency": "USD",
    "balance": "750.00"
  },
  "receiver": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "currency": "USD",
    "balance": "250.00"
  },
  "reference": "TXN-1702618400000-B4D8E2F",
  "idempotencyKey": "transfer-2025-12-15-xyz789"
}
```

### 4. Get Wallet Details

**GET** `/wallets/:id`

**Response:**
```json
{
  "wallet": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "currency": "USD",
    "balance": "750.00"
  },
  "transactions": [
    {
      "id": "tx-001",
      "walletId": "550e8400-e29b-41d4-a716-446655440000",
      "type": "TRANSFER_OUT",
      "amount": "250.00",
      "status": "COMPLETED",
      "reference": "TXN-1702618400000-B4D8E2F",
      "description": "Payment for services",
      "createdAt": "2025-12-15T10:45:00.000Z",
      "receiverWalletId": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
    },
    {
      "id": "tx-002",
      "walletId": "550e8400-e29b-41d4-a716-446655440000",
      "type": "DEPOSIT",
      "amount": "1000.00",
      "status": "COMPLETED",
      "reference": "TXN-1702617600000-A3B7C9D",
      "description": "Initial deposit",
      "createdAt": "2025-12-15T10:30:00.000Z"
    }
  ]
}
```

### Error Responses

**Validation Error (400)**
```json
{
  "message": ["amount must be greater than 0"],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Not Found (404)**
```json
{
  "message": "Wallet with ID xxx not found",
  "error": "Not Found",
  "statusCode": 404
}
```

**Business Logic Error (400)**
```json
{
  "message": "Insufficient balance",
  "error": "Bad Request",
  "statusCode": 400
}
```

## Testing

### Run All Tests

```bash
pnpm test
```

### Run Tests in Watch Mode

```bash
pnpm run test:watch
```

### Run Tests with Coverage

```bash
pnpm run test:cov
```

**Test Coverage:** 19 unit tests covering all core functionality including:
- Wallet creation
- Fund operations
- Transfer operations
- Transaction history
- Idempotency
- Error handling
- Database transaction rollbacks

### Run E2E Tests

```bash
pnpm run test:e2e
```

## Project Structure

```
nestjs-wallet-service/
├── src/
│   ├── config/
│   │   └── database.config.ts       # Database configuration
│   ├── entities/
│   │   ├── wallet.entity.ts         # Wallet entity with relations
│   │   └── transaction.entity.ts    # Transaction entity with enums
│   ├── wallet/
│   │   ├── controllers/
│   │   │   └── wallet.controller.ts # API endpoints
│   │   ├── dto/
│   │   │   ├── create-wallet.dto.ts
│   │   │   ├── fund-wallet.dto.ts
│   │   │   └── transfer.dto.ts
│   │   ├── services/
│   │   │   ├── wallet.service.ts     # Business logic
│   │   │   └── wallet.service.spec.ts # Unit tests
│   │   └── wallet.module.ts
│   ├── app.module.ts                 # Root module
│   └── main.ts                       # Application entry point
├── test/                             # E2E tests
├── docker-compose.yml                # PostgreSQL Docker setup
├── .env                              # Environment variables
└── package.json
```

## Assumptions

### 1. **Currency Handling**
- Only three currencies are supported: USD, EUR, and NGN
- No currency conversion is implemented
- Transfers can only occur between wallets with the same currency

### 2. **Decimal Precision**
- All amounts are stored as `DECIMAL(12, 2)` in the database
- This allows for amounts up to 9,999,999,999.99
- Precision is limited to 2 decimal places (cents)

### 3. **Transaction Flow**
- All transactions are considered atomic (all-or-nothing)
- Failed transactions are rolled back automatically
- Transaction status is set to `COMPLETED` immediately after successful processing
- No `FAILED` status is currently persisted (transactions are rolled back on failure)

### 4. **Idempotency**
- Idempotency keys are **optional** and client-provided
- The system uses a two-level cache:
  - In-memory Map for fast lookups (resets on server restart)
  - Database check as fallback (persistent)
- Idempotency keys are stored in the `metadata` field as JSON
- Auto-generated `reference` fields serve as transaction IDs for tracking

### 5. **Security**
- No authentication/authorization is implemented (as per test requirements)
- No rate limiting is currently in place
- In production, these would be required

### 6. **Database**
- TypeORM `synchronize: true` is used in development (auto-creates tables)
- In production, this should be disabled and migrations should be used
- PostgreSQL is the only supported database

### 7. **Balance Validation**
- Balances cannot go negative
- The system checks balance before processing transfers
- Race conditions are handled by database transactions

### 8. **Transaction History**
- All transactions are permanent (no deletion)
- Transactions are returned in descending order (newest first)
- Redundant wallet IDs are filtered from response based on transaction type:
  - `TRANSFER_OUT`: Shows only `receiverWalletId`
  - `TRANSFER_IN`: Shows only `senderWalletId`
  - `DEPOSIT`/`WITHDRAWAL`: Shows neither

### 9. **Error Handling**
- All validation errors return 400 Bad Request
- Missing resources return 404 Not Found
- All error messages are descriptive and user-friendly

### 10. **Testing Assumptions**
- Tests use mocked repositories (no actual database)
- In-memory idempotency cache is tested but not persistent across service restarts
- E2E tests would require a test database

# Production Scaling Considerations

### 1. **Idempotency Cache**
- **Current**: In-memory Map (not distributed)
- **Production**: Replace with Redis for distributed caching
- **Benefit**: Idempotency works across multiple server instances

```typescript
@Injectable()
export class RedisIdempotencyService {
  async get(key: string) {
    return await redis.get(key);
  }
  
  async set(key: string, value: any, ttl: number = 3600) {
    await redis.setex(key, ttl, JSON.stringify(value));
  }
}
```

### 2. **Database Optimization**
- Add indexes:
  ```sql
  CREATE INDEX idx_wallet_id ON transactions(walletId);
  CREATE INDEX idx_reference ON transactions(reference);
  CREATE INDEX idx_created_at ON transactions(createdAt);
  CREATE INDEX idx_metadata_idempotency ON transactions USING gin(metadata);
  ```
- Use connection pooling (already configured in TypeORM)
- Consider read replicas for heavy read operations

### 3. **Concurrency & Race Conditions**
- Current database transactions handle race conditions at the DB level
- For high-traffic scenarios, consider optimistic locking:
  ```typescript
  @VersionColumn()
  version: number;
  ```

### 4. **Load Balancing**
- The service is stateless and supports horizontal scaling
- Use a load balancer (e.g., NGINX, AWS ALB) to distribute traffic
- Session affinity is not required

### 5. **Rate Limiting**
- Implement per-wallet or per-IP rate limiting
- Recommended: Redis-based rate limiter
- Example: 100 requests per wallet per minute

### 6. **Monitoring & Logging**
- Add structured logging (e.g., Winston, Pino)
- Track key metrics:
  - Transaction success/failure rates
  - Average response times
  - Idempotency cache hit rate
- Use APM tools (e.g., Datadog, New Relic)

### 7. **Security Enhancements**
- Add JWT-based authentication
- Implement role-based access control (RBAC)
- Use HTTPS/TLS for all communications
- Add request signing for critical operations
- Implement 2FA for high-value transactions

### 8. **Database Migrations**
- Disable `synchronize: true` in production
- Use TypeORM migrations for schema changes:
  ```bash
  npm run typeorm migration:generate -- -n MigrationName
  npm run typeorm migration:run
  ```

### 9. **Caching Strategy**
- Cache wallet details (short TTL: 30-60 seconds)
- Invalidate cache on balance updates
- Use Redis for distributed caching

### 10. **Backup & Disaster Recovery**
- Automated daily database backups
- Point-in-time recovery (PITR) enabled
- Regular backup testing and restoration drills
- Multi-region replication for critical systems
