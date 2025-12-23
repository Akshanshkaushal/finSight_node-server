# FinSight - Personal Finance Advisory Platform

A production-grade, event-driven microservices application built with Node.js and Express.js for providing personalized financial advice based on verified financial news, user profiles, and risk assessment.

## 🏗️ Architecture Overview

FinSight follows a **microservices architecture** with **event-driven communication**:

- **API Gateway** as the single entry point
- **9 Independent Microservices** communicating via REST and Kafka
- **Polyglot Persistence**: PostgreSQL for relational data, MongoDB for news articles, Redis for caching
- **Stateless Services** for horizontal scalability
- **Event-Driven** for async processing and loose coupling

## 📋 Table of Contents

- [Architecture](#architecture)
- [Microservices](#microservices)
- [Event Flow](#event-flow)
- [Data Flow](#data-flow)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Production Deployment](#production-deployment)

## 🏛️ Architecture

### System Architecture Diagram

```
                    ┌─────────────┐
                    │ API Gateway  │
                    │   (Port 3000)│
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐        ┌────▼────┐       ┌────▼────┐
   │  Auth   │        │  User   │       │  News   │
   │ Service │        │ Service │       │ Service │
   └─────────┘        └────┬────┘       └────┬────┘
                           │                  │
                           │                  │ (Kafka)
                           │                  │
                    ┌──────▼──────────────────▼──────┐
                    │      Finance Engine            │
                    │    (Risk Calculation)          │
                    └──────┬─────────────────────────┘
                           │ (Kafka)
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │Advisory │       │Notification│     │Subscription│
   │ Service │       │  Service  │     │  Service   │
   └─────────┘       └───────────┘     └─────┬──────┘
                                             │
                                        ┌────▼────┐
                                        │ Payment │
                                        │ Service │
                                        └─────────┘
```

### Communication Patterns

- **Synchronous**: REST APIs for request/response (via API Gateway)
- **Asynchronous**: Kafka events for system reactions
- **No Shared Databases**: Each service owns its data
- **No Direct DB Access**: Services communicate via APIs only

## 🔧 Microservices

### 1. **API Gateway** (Port 3000)
- Single entry point for all client requests
- JWT authentication & authorization
- Request routing & proxying
- Rate limiting (FREE vs PREMIUM)
- Subscription enforcement

### 2. **Auth Service** (Port 3001)
- User registration & login
- JWT token generation (access + refresh)
- Password hashing (bcrypt)
- Token refresh logic
- **Database**: PostgreSQL (`finsight_auth`)

### 3. **User Service** (Port 3002)
- User financial profiles (income, expenses, loans)
- Loan management
- Profile CRUD operations
- **Database**: PostgreSQL (`finsight_users`)
- **Cache**: Redis for profile caching

### 4. **News Service** (Port 3003)
- Periodic financial news fetching (cron-based)
- News verification & classification
- Deduplication using Redis
- Kafka event publishing
- **Database**: MongoDB (`finsight_news`)
- **Cache**: Redis for deduplication

### 5. **Finance Engine** (Port 3004)
- Consumes verified news events (Kafka)
- Fetches user profiles (REST)
- Risk score calculation
- Personalized advice generation
- Publishes advisory events (Kafka)
- **Cache**: Redis for risk calculations

### 6. **Advisory Service** (Port 3005)
- Persists advice history
- Exposes advisory APIs
- Enforces subscription limits
- Consumes advisory events (Kafka)
- **Database**: PostgreSQL (`finsight_advisory`)

### 7. **Notification Service** (Port 3006)
- Consumes notification events (Kafka)
- Sends emails/notifications
- Logs all notifications
- **Database**: PostgreSQL (`finsight_notifications`)

### 8. **Subscription Service** (Port 3007)
- Manages FREE/PREMIUM plans
- Tracks subscription status
- Exposes entitlement APIs
- Publishes upgrade events (Kafka)
- **Database**: PostgreSQL (`finsight_subscriptions`)

### 9. **Payment Service** (Port 3008)
- Mock payment gateway (V1)
- Webhook-ready architecture (V2)
- Handles subscription upgrades
- **Database**: PostgreSQL (`finsight_payments`)

## 🔄 Event Flow

### News → Advice → Notification Flow

```
1. News Service fetches financial news (cron)
   ↓
2. News verified & deduplicated (Redis)
   ↓
3. News published to Kafka: verified-financial-news
   ↓
4. Finance Engine consumes news event
   ↓
5. Finance Engine fetches user profiles (REST)
   ↓
6. Finance Engine calculates risk scores
   ↓
7. Finance Engine generates personalized advice
   ↓
8. Advisory published to Kafka: user-advisory-generated
   ↓
9. Advisory Service persists advice
   ↓
10. If HIGH risk → Notification event: notification-requested
    ↓
11. Notification Service sends email
```

### Payment → Subscription Upgrade Flow

```
1. User initiates payment (Payment Service)
   ↓
2. Payment processed (mock gateway)
   ↓
3. Payment Service calls Subscription Service (REST)
   ↓
4. Subscription upgraded to PREMIUM
   ↓
5. Subscription-upgraded event published (Kafka)
```

## 📊 Data Flow

### Data Stores

- **PostgreSQL**: Users, profiles, loans, advisories, subscriptions, payments, notifications
- **MongoDB**: Financial news articles
- **Redis**: Caching & deduplication (no persistence)
- **Kafka**: Event streaming (no persistence)

### Data Ownership

- Each service owns its database
- No cross-service database access
- Services communicate via REST APIs or Kafka events

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+ (LTS)
- **Framework**: Express.js
- **Databases**: PostgreSQL 15, MongoDB 7
- **Cache**: Redis 7
- **Message Queue**: Apache Kafka
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **ORM**: Sequelize (PostgreSQL), Mongoose (MongoDB)
- **Logging**: Winston
- **Containerization**: Docker & Docker Compose

## 📦 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Git

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd node_finsight_server
   ```

2. **Start all services**
   ```bash
   cd docker
   docker-compose up -d
   ```

3. **Check service health**
   ```bash
   # API Gateway
   curl http://localhost:3000/health

   # All services
   curl http://localhost:3001/health  # Auth
   curl http://localhost:3002/health  # User
   curl http://localhost:3003/health  # News
   curl http://localhost:3004/health  # Finance Engine
   curl http://localhost:3005/health  # Advisory
   curl http://localhost:3006/health  # Notification
   curl http://localhost:3007/health  # Subscription
   curl http://localhost:3008/health  # Payment
   ```

4. **View logs**
   ```bash
   docker-compose logs -f [service-name]
   ```

### Local Development

1. **Install dependencies for each service**
   ```bash
   cd api-gateway && npm install
   cd ../auth-service && npm install
   # ... repeat for all services
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up -d postgres-auth postgres-users mongodb redis zookeeper kafka
   ```

3. **Set environment variables** (create `.env` files in each service)

4. **Start services individually**
   ```bash
   cd api-gateway && npm start
   cd ../auth-service && npm start
   # ... repeat for all services
   ```

## 📚 API Documentation

### Authentication

**Register User**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### User Profile

**Get Profile**
```http
GET /users/{userId}
Authorization: Bearer {accessToken}
```

**Update Profile**
```http
PUT /users/{userId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "income": 100000,
  "expenses": 60000,
  "riskAppetite": "MODERATE"
}
```

**Add Loan**
```http
POST /users/{userId}/loans
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "loanType": "HOME_LOAN",
  "principalAmount": 5000000,
  "interestRate": 8.5,
  "tenureMonths": 240,
  "isFloatingRate": true
}
```

### News

**Get News**
```http
GET /news?category=RBI_POLICY&impactLevel=HIGH&limit=20
Authorization: Bearer {accessToken}
```

**Trigger News Fetch** (Admin)
```http
POST /news/fetch
Authorization: Bearer {accessToken}
```

### Advisories

**Get Advisories**
```http
GET /advisories/{userId}?limit=20&offset=0
Authorization: Bearer {accessToken}
```

**Get Advisory Detail**
```http
GET /advisories/detail/{advisoryId}
Authorization: Bearer {accessToken}
```

### Subscriptions

**Get Subscription**
```http
GET /subscriptions/{userId}
Authorization: Bearer {accessToken}
```

**Upgrade Subscription**
```http
POST /subscriptions/{userId}/upgrade
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "paymentId": "payment-uuid"
}
```

### Payments

**Create Payment**
```http
POST /payments
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "amount": 999,
  "paymentMethod": "credit_card"
}
```

**Get Payment**
```http
GET /payments/{paymentId}
Authorization: Bearer {accessToken}
```

## 🔐 Subscription Plans

### FREE Plan
- 10 requests/minute
- 100 requests/hour
- 5 advisories per day
- 10 news articles access

### PREMIUM Plan
- 60 requests/minute
- 1000 requests/hour
- Unlimited advisories
- Unlimited news articles

## 🧪 Testing the Flow

1. **Register & Login**
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

2. **Create User Profile**
   ```bash
   curl -X PUT http://localhost:3000/users/{userId} \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"income":100000,"expenses":60000,"riskAppetite":"MODERATE"}'
   ```

3. **Add Loan**
   ```bash
   curl -X POST http://localhost:3000/users/{userId}/loans \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{"loanType":"HOME_LOAN","principalAmount":5000000,"interestRate":8.5,"tenureMonths":240,"isFloatingRate":true}'
   ```

4. **Trigger News Fetch**
   ```bash
   curl -X POST http://localhost:3000/news/fetch \
     -H "Authorization: Bearer {token}"
   ```

5. **Check Advisories** (after news processing)
   ```bash
   curl http://localhost:3000/advisories/{userId} \
     -H "Authorization: Bearer {token}"
   ```

## 🏭 Production Deployment

### Environment Variables

Each service requires environment variables. See `.env.example` files in each service directory.

### Key Production Considerations

1. **Security**
   - Change all default secrets (JWT_SECRET, DB_PASSWORDS)
   - Use environment variables for sensitive data
   - Enable HTTPS/TLS
   - Implement proper CORS policies

2. **Scalability**
   - Use Kubernetes or ECS for orchestration
   - Implement horizontal scaling for stateless services
   - Use managed services (RDS, MSK, ElastiCache) on AWS

3. **Monitoring**
   - Implement APM (Application Performance Monitoring)
   - Set up centralized logging (ELK, CloudWatch)
   - Configure health checks and alerts

4. **Database**
   - Use managed PostgreSQL (RDS) and MongoDB (Atlas)
   - Implement database backups
   - Configure connection pooling

5. **Kafka**
   - Use managed Kafka (MSK on AWS)
   - Configure replication factor > 1
   - Set up monitoring and alerting

## 📁 Project Structure

```
finsight/
├── api-gateway/
├── auth-service/
├── user-service/
├── news-service/
├── finance-engine/
├── advisory-service/
├── notification-service/
├── subscription-service/
├── payment-service/
├── common/
│   ├── events/
│   ├── dto/
│   ├── enums/
│   ├── constants/
│   ├── errors/
│   └── utils/
├── docker/
│   └── docker-compose.yml
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Node.js and Express.js**

