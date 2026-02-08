# User Onboarding & Approval Platform

A secure, containerized full-stack web application for user self-registration with administrator approval workflow.

## Features

- **User Self-Registration**: Users can create accounts with email validation
- **Admin Approval Workflow**: Administrators review and approve/reject pending registrations
- **Status Tracking**: Users can check their approval status in real-time
- **Secure Authentication**: JWT-based auth with password hashing (bcryptjs)
- **Horizontal Scaling**: Stateless backend, Redis-based queue system
- **Docker Containerization**: Full Docker & docker-compose setup
- **Environment-based Configuration**: All secrets externalized via `.env`
- **Separation of Concerns**: API layer, queue worker layer, and presentation layer

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│              (Vite, Zustand, Axios)                       │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/JSON
┌────────────────▼────────────────────────────────────────────┐
│              Backend API (Express)                          │
│  - Auth Routes (/register, /login)                         │
│  - Admin Routes (/pending-users, /approve, /reject)        │
│  - User Routes (/profile, /status)                         │
└────┬──────────────────────────────────┬────────────────────┘
     │                                  │
     │ Queries                          │ Events
     │                                  │
┌────▼──────────────────┐    ┌─────────▼──────────────┐
│   PostgreSQL DB       │    │  Redis Queue           │
│  - users table        │    │  - approval_queue      │
│  - audit_logs table   │    │  - notifications       │
│  - approval_queue     │    │                        │
└───────────────────────┘    └──────────┬─────────────┘
                                        │
                             ┌──────────▼─────────────┐
                             │  Worker Service        │
                             │  (Queue Processor)     │
                             └────────────────────────┘
```

## Tech Stack

### Frontend
- React 18 + Vite
- React Router for navigation
- Zustand for state management
- Axios for API calls

### Backend
- Node.js + Express
- PostgreSQL for data persistence
- Redis for queue/caching
- JWT for authentication
- bcryptjs for password hashing
- Joi for input validation

### Infrastructure
- Docker & Docker Compose
- GitHub Actions for CI/CD
- Nginx (optional reverse proxy)

## Prerequisites

- Docker & Docker Compose (recommended)
- OR Node.js ≥18, npm ≥9, PostgreSQL, Redis

## Quick Start (Docker)

### 1. Clone Repository

```bash
git clone <repository-url>
cd user-onboarding-platform
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and customize values if needed:

```bash
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/onboarding_db
JWT_SECRET=your_secure_jwt_secret_here
CORS_ORIGIN=http://localhost:3000
```

### 3. Start All Services

```bash
docker-compose up --build
```

The system will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432
- **Redis**: localhost:6379

### 4. Initialize Database

```bash
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

## Default Credentials (After Seeding)

- **Admin**: `admin@example.com` / `admin123456`
- **Pending Users**: `john@example.com`, `jane@example.com` (password: `password123`)

## Local Development (Without Docker)

### 1. Install Dependencies

```bash
npm install --workspaces
```

### 2. Setup Database

```bash
# Start PostgreSQL and Redis locally
# Then run migrations
cd backend
npm run migrate
npm run seed
```

### 3. Start Services in Separate Terminals

**Terminal 1 - Backend API**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Worker Service**:
```bash
cd backend
npm run worker
```

**Terminal 3 - Frontend**:
```bash
cd frontend
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User self-registration
- `POST /api/auth/login` - Login for admin/users
- `POST /api/auth/validate-token` - Validate JWT token

### Admin
- `GET /api/admin/pending-users` - List pending registrations
- `PUT /api/admin/approve/:userId` - Approve user
- `PUT /api/admin/reject/:userId` - Reject user
- `GET /api/admin/stats` - Get approval statistics

### User
- `GET /api/user/profile` - Get user profile & status
- `GET /api/user/status` - Check approval status

## Environment Variables

```
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Backend
NODE_ENV=development|production
PORT=3001
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000

# Redis/Queue
REDIS_URL=redis://localhost:6379

# Frontend
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
```

## Project Structure

```
user-onboarding-platform/
├── backend/
│   ├── src/
│   │   ├── server.js           # Express app entry
│   │   ├── middleware/         # Auth, error handling
│   │   ├── routes/             # API endpoints
│   │   ├── models/             # Database queries
│   │   ├── services/           # Business logic
│   │   ├── workers/            # Queue processors
│   │   └── db/                 # Migrations, seeds
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/              # Route pages
│   │   ├── components/         # React components
│   │   ├── services/           # API calls
│   │   ├── stores/             # Zustand stores
│   │   ├── styles/             # CSS
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Key Features Implementation

### 1. User Registration Flow
- Users POST to `/api/auth/register`
- Input validation with Joi
- Password hashing with bcryptjs (SALT_ROUNDS=12)
- User created with PENDING status
- Stored in PostgreSQL

### 2. Admin Approval Workflow
- Admin logs in and views pending users
- Admin clicks Approve/Reject
- Request sent to `/api/admin/approve/:userId`
- User status updated to APPROVED/REJECTED
- Events published to Redis queue for async processing

### 3. Queue-Based Architecture
- Approval events added to Redis queue
- Worker service continuously polls queue
- Processes events asynchronously
- Decouples API from notification/audit tasks
- Enables horizontal scaling

### 4. Security
- **Password**: Hashed with bcryptjs (12 rounds)
- **JWT**: Signed tokens with 24h expiration
- **Environment Secrets**: No hardcoded credentials
- **Input Validation**: Joi schemas on all inputs
- **CORS**: Restricted to configured origin
- **Helmet**: Security headers enabled

## Scaling Considerations

### Horizontal Scaling

1. **Stateless API**: All sessions stored in JWT, not server memory
2. **Database**: PostgreSQL connection pooling (min 2, max 10)
3. **Cache/Queue**: Redis handles concurrent requests
4. **Workers**: Can run on separate instances/containers

Example scaling with Kubernetes:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: backend:latest
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci-cd.yml`):

1. **Test**: Lint and unit tests on push
2. **Build**: Build Docker images
3. **Security**: Trivy vulnerability scanning
4. **Deploy**: Push to production (on main branch)

## Monitoring & Logging

Add to `docker-compose.yml` for production:

```yaml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana
  depends_on:
    - prometheus
```

## Common Tasks

### Reset Database
```bash
docker-compose down -v
docker-compose up
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Access Database
```bash
docker-compose exec postgres psql -U postgres -d onboarding_db
```

### Rebuild Images
```bash
docker-compose build --no-cache
```

## Production Deployment

### Pre-Deployment Checklist

1. **Environment**:
   - Set `NODE_ENV=production`
   - Update `JWT_SECRET` to secure value
   - Configure `CORS_ORIGIN` for production domain
   - Update `REACT_APP_API_URL` to production API URL

2. **Database**:
   - Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
   - Enable SSL connections
   - Configure backups
   - Set appropriate pool sizes

3. **Cache**:
   - Use managed Redis (AWS ElastiCache, Redis Cloud, etc.)
   - Enable encryption
   - Configure persistence

4. **Secrets**:
   - Use environment variable management (GitHub Secrets, HashiCorp Vault)
   - Never commit `.env` files
   - Rotate `JWT_SECRET` periodically

5. **Monitoring**:
   - Enable application logging to CloudWatch/DataDog/etc.
   - Set up alerts for errors and performance
   - Monitor database query performance

### Deployment Options

- **Docker Swarm**: `docker stack deploy -c docker-compose.yml`
- **Kubernetes**: Use provided YAML manifests
- **Cloud Platforms**:
  - AWS ECS/Fargate
  - Google Cloud Run
  - Azure Container Instances
  - DigitalOcean App Platform

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Rebuild and restart
docker-compose down
docker-compose up --build postgres
```

### Redis Connection Error
```bash
# Check Redis is running
docker-compose exec redis redis-cli ping

# Restart
docker-compose restart redis
```

### Frontend Can't Connect to API
- Check `REACT_APP_API_URL` is correct in `.env`
- Ensure backend is running: `curl http://localhost:3001/health`
- Check CORS settings: `CORS_ORIGIN=http://localhost:3000`

### Pending Users Not Processing
```bash
# Check worker is running
docker-compose ps worker

# View worker logs
docker-compose logs -f worker

# Check Redis queue
docker-compose exec redis redis-cli LLEN approval:queue
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit Pull Request

## License

MIT

## Support

For issues and questions, open a GitHub issue or contact support.

---

**Status**: Production-ready with extended features available in branches
