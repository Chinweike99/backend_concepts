# HNG13-Backend Task0 - Dynamic Profile API

A NestJS-based RESTful API that returns profile information along with dynamic cat facts from an external API. Built with TypeScript and includes rate limiting, error handling, and comprehensive testing.

## Features

- GET `/me` endpoint with dynamic profile data
- Integration with Cat Facts API (https://catfact.ninja/fact)
- Rate limiting
- Proper error handling and fallback mechanisms
- Environment-based configuration
- Comprehensive logging
- CORS enabled
- Unit tests
- TypeScript support

## API Documentation

### Base URL
```bash
http://localhost:4000
```

### Endpoints

#### GET /me
Returns profile information with a dynamic cat fact.

**Response:**
```json
{
  "status": "success",
  "user": {
    "email": "akwolu.innocent.chinweike@gmail.com",
    "name": "Akwolu Innocent Chinweike",
    "stack": "Node.js/NestJS/TypeScript"
  },
  "timestamp": "2024-01-15T10:30:45.123Z",
  "fact": "Cats have five toes on their front paws, but only four on the back paws."
}
```
## Local Development Setup
### 1. Clone the Repository
```bash
git clone https://github.com/Chinweike99/hng13-backend-task0.git
cd hng13-backend-task0
```
### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
NAME=Akwolu Innocent Chinweike
EMAIL=akwolu.innocent.chinweike@gmail.com
STACK=Node.js/NestJS/TypeScript
CAT_API_TIMEOUT=5000
PORT=4000
```

### 4. Run the Application
```bash
npm run start:dev
```

## Testing
### Run Unit Tests
```bash
npm run test
```