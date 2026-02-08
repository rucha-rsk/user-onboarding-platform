# Getting Started Guide

## 5-Minute Quick Start

### Prerequisites
- Docker & Docker Compose installed
  - Download: https://www.docker.com/products/docker-desktop

### Steps

**Step 1: Setup Environment**
```bash
cd user-onboarding-platform
cp .env.example .env
```

**Step 2: Start Services**
```bash
docker-compose up --build
```

Wait for all containers to be healthy (~30-60 seconds)

**Step 3: Initialize Database**

Open a new terminal and run:
```bash
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

**Step 4: Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/health
- Database: localhost:5432 (admin / postgres)

### Default Accounts (After Seeding)

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123456`

**Sample Pending Users:**
- Email: `john@example.com` | Password: `password123`
- Email: `jane@example.com` | Password: `password123`

---

## Testing the Full Flow

### 1. Register as New User (http://localhost:3000)

1. Click "Register here" link
2. Fill in form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `testuser@example.com`
   - Password: `MyPassword123`
3. Click Register
4. See success message: "Awaiting admin approval"

### 2. Admin Approval (http://localhost:3000)

1. Go to http://localhost:3000/login
2. Login as admin:
   - Email: `admin@example.com`
   - Password: `admin123456`
3. View pending users in dashboard
4. Click "Approve" or "Reject" for `testuser@example.com`
5. User disappears from pending list

### 3. User Login with Approved Status

1. Logout (button top-right)
2. Go to http://localhost:3000/login
3. Try login with new user:
   - Email: `testuser@example.com`
   - Password: `MyPassword123`
4. Should now succeed and see user dashboard
5. View approval status showing "Approved"

---

## Common Tasks

### View Admin Dashboard
- Navigate to: http://localhost:3000
- After admin login, redirects to: http://localhost:3000/admin

### View Database
```bash
docker-compose exec postgres psql -U postgres -d onboarding_db
```

Then in psql:
```sql
-- View all users
SELECT id, email, first_name, status FROM users;

-- View pending users
SELECT * FROM users WHERE status = 'PENDING';

-- View audit logs
SELECT * FROM audit_logs;
```

### View Logs
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Database logs
docker-compose logs -f postgres

# All services
docker-compose logs -f
```

### Stop All Services
```bash
docker-compose down
```

### Reset Database
```bash
docker-compose down -v          # Remove volumes
docker-compose up --build       # Rebuild & start
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

### Check Service Health
```bash
# See all containers
docker-compose ps

# Check specific container
docker-compose exec backend curl http://localhost:3001/health
```

---

## Local Development (Without Docker)

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Redis 6+

### Setup

**1. Install Dependencies**
```bash
npm install --workspaces
```

**2. Start PostgreSQL & Redis**
```bash
# On macOS (if using Homebrew)
brew services start postgresql
brew services start redis

# On Linux
sudo systemctl start postgresql
sudo systemctl start redis-server

# On Windows (or use Docker for these)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine
docker run -d -p 6379:6379 redis:7-alpine
```

**3. Setup Environment**
```bash
cp .env.example .env
```

**4. Initialize Database**
```bash
cd backend
npm run migrate
npm run seed
```

**5. Start Services (3 Terminal Tabs)**

Terminal 1 - Backend API:
```bash
cd backend
npm run dev
```

Terminal 2 - Worker Service:
```bash
cd backend
npm run worker
```

Terminal 3 - Frontend:
```bash
cd frontend
npm run dev
```

Access: http://localhost:3000

---

## API Examples

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123",
    "firstName": "Jane",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123456"
  }'
```

Response includes `token` - use for authenticated endpoints

### Get Pending Users (Admin Only)
```bash
curl -X GET http://localhost:3001/api/admin/pending-users \
  -H "Authorization: Bearer TOKEN_HERE"
```

### Approve User
```bash
curl -X PUT http://localhost:3001/api/admin/approve/2 \
  -H "Authorization: Bearer TOKEN_HERE"
```

### Get User Profile
```bash
curl -X GET http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer TOKEN_HERE"
```

### Health Check
```bash
curl http://localhost:3001/health
```

---

## Troubleshooting

### Port Already in Use

If you get "port already in use" error:

```bash
# Find process on port 3000
lsof -i :3000

# Find process on port 3001
lsof -i :3001

# Find process on port 5432
lsof -i :5432

# Kill process (replace PID with actual number)
kill -9 <PID>
```

Or change ports in `docker-compose.yml` or `.env`

### Database Connection Failed

```bash
# Check if postgres container is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Frontend Can't Connect to API

1. Check backend is running: `curl http://localhost:3001/health`
2. Check `REACT_APP_API_URL` in frontend `.env`
3. Check browser console (F12) for CORS errors
4. Verify `CORS_ORIGIN` in backend `.env`

### Password Hashing Takes Too Long

If registration is slow, the bcrypt computation might be heavy. This is normal for high round counts (12 rounds = ~100ms). For local dev, can temporarily reduce `SALT_ROUNDS` in `backend/src/services/authService.js` to 10.

### Worker Not Processing

```bash
# Check Redis connection
docker-compose exec redis redis-cli ping

# Check queue size
docker-compose exec redis redis-cli LLEN approval:queue

# View worker logs
docker-compose logs -f worker
```

---

## Next Steps

### 1. Explore the Code
- Frontend components: `frontend/src/pages/`
- Backend routes: `backend/src/routes/`
- Database models: `backend/src/models/`
- API services: `frontend/src/services/api.js`

### 2. Add Features
- Email notifications
- Password reset
- Profile editing
- Two-factor authentication
- Batch approval

### 3. Deploy to Production
- See [README.md](./README.md) for deployment options
- Update secrets in `.env`
- Configure SSL certificates
- Set up monitoring

### 4. Customize
- Modify registration form fields
- Add company/team support
- Custom approval workflows
- Integration with external systems

---

## Resources

- **Full Documentation**: [README.md](./README.md)
- **Project Summary**: [SUMMARY.md](./SUMMARY.md)
- **Environment Template**: [.env.example](./.env.example)
- **Docker Docs**: https://docs.docker.com/
- **React Docs**: https://react.dev/
- **Express Docs**: https://expressjs.com/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

**Everything is set up and ready to go! 🚀**

Questions? Check the troubleshooting section above or review the code comments.
