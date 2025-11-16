# Getting Started with SuberFood Development

Welcome to the SuberFood development team! This guide will help you set up your local development environment and start contributing to the project.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

### Required Software

1. **Node.js** (v18.0.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (v9.0.0 or higher)
   - Comes with Node.js
   - Verify installation: `npm --version`

3. **Docker Desktop**
   - Download from [docker.com](https://www.docker.com/products/docker-desktop/)
   - Required for running local databases and services
   - Verify installation: `docker --version` and `docker-compose --version`

4. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

### Recommended Tools

- **VS Code** or your preferred IDE
- **Postman** or **Insomnia** for API testing
- **TablePlus** or **pgAdmin** for database management (optional, included in Docker)

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/suberfood/suberfood.git
cd suberfood
```

### 2. Install Dependencies

```bash
# Install all dependencies for the monorepo
npm install
```

This will install dependencies for all apps and services in the workspace.

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your actual values
# For local development, the defaults should work
```

### 4. Start Docker Services

Start all the required infrastructure services (PostgreSQL, MongoDB, Redis, Kafka, etc.):

```bash
# Start all Docker services
docker-compose up -d

# Verify all services are running
docker-compose ps
```

You should see all services in "Up" status:
- PostgreSQL (port 5432)
- MongoDB (port 27017)
- Redis (port 6379)
- Kafka (port 9092)
- Elasticsearch (port 9200)
- MinIO (port 9000, 9001)
- pgAdmin (port 5050)
- Mongo Express (port 8081)

### 5. Initialize Databases

```bash
# Run database migrations (coming soon)
# npm run db:migrate

# Seed development data (coming soon)
# npm run db:seed
```

---

## Running the Applications

### Option 1: Run All Applications

```bash
# Start all apps in development mode (uses Turborepo)
npm run dev
```

This will start:
- Landing Page: http://localhost:3000
- Admin Dashboard: http://localhost:3001
- All backend services

### Option 2: Run Specific Applications

```bash
# Run only the landing page
cd apps/landing-page
npm run dev

# Run only the IAM service
cd services/iam-service
npm run dev
```

---

## Accessing the Applications

### Frontend Applications

| Application | URL | Description |
|-------------|-----|-------------|
| Landing Page | http://localhost:3000 | Public marketing website |
| Admin Dashboard | http://localhost:3001 | Internal admin panel |
| Farm Management | http://localhost:3002 | Farm operations app |
| Restaurant POS | http://localhost:3003 | Point of sale system |

### Backend Services

| Service | Port | Health Check |
|---------|------|--------------|
| IAM Service | 4001 | http://localhost:4001/health |
| Farm Service | 4002 | http://localhost:4002/health |
| Order Service | 4003 | http://localhost:4003/health |

### Infrastructure Services

| Service | URL | Credentials |
|---------|-----|-------------|
| pgAdmin | http://localhost:5050 | admin@suberfood.com / admin |
| Mongo Express | http://localhost:8081 | - |
| MinIO Console | http://localhost:9001 | suberfood / dev_password_change_in_prod |

---

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull origin main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write code following the project's coding standards
- Write unit tests for new functionality
- Update documentation if needed

### 3. Run Tests

```bash
# Run all tests
npm run test

# Run tests for specific package
cd services/iam-service
npm run test

# Run tests in watch mode
npm run test:watch
```

### 4. Lint and Format

```bash
# Run linter
npm run lint

# Format code
npm run format
```

### 5. Commit Your Changes

Follow semantic commit message format:

```bash
git add .
git commit -m "feat: add user authentication endpoint"
```

**Commit Message Format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### 6. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create a pull request on GitHub
# Request code review from team members
```

---

## Project Structure Deep Dive

### Frontend Applications (`apps/`)

Each frontend app is a separate Next.js or React application:

```
apps/landing-page/
├── src/
│   ├── app/              # App router (Next.js 14)
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript types
├── public/               # Static assets
├── package.json
├── tsconfig.json
└── next.config.js
```

### Backend Services (`services/`)

Each microservice follows Clean Architecture:

```
services/iam-service/
├── src/
│   ├── api/                    # API layer
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # Route definitions
│   │   └── middleware/         # Express middleware
│   ├── application/            # Application layer
│   │   ├── use-cases/          # Business use cases
│   │   └── dto/                # Data transfer objects
│   ├── domain/                 # Domain layer
│   │   ├── entities/           # Business entities
│   │   ├── repositories/       # Repository interfaces
│   │   └── services/           # Domain services
│   ├── infrastructure/         # Infrastructure layer
│   │   ├── database/           # Database connections
│   │   ├── repositories/       # Repository implementations
│   │   └── external/           # External service clients
│   ├── config/                 # Configuration
│   └── index.ts                # Entry point
├── tests/
├── package.json
└── tsconfig.json
```

---

## Common Tasks

### Adding a New Package Dependency

```bash
# For a specific app
cd apps/landing-page
npm install <package-name>

# For a specific service
cd services/iam-service
npm install <package-name>

# For shared packages
cd shared/utils
npm install <package-name>
```

### Creating a New Component (Frontend)

```bash
# Create component file
touch apps/landing-page/src/components/MyComponent.tsx

# Example component:
```

```typescript
export function MyComponent() {
  return (
    <div className="p-4">
      <h2>My Component</h2>
    </div>
  );
}
```

### Creating a New API Endpoint (Backend)

```typescript
// services/iam-service/src/api/routes/users.ts
import { Router } from 'express';

const router = Router();

router.get('/users', async (req, res) => {
  // TODO: Implement
  res.json({ users: [] });
});

export default router;
```

### Database Migrations

```bash
# Create a new migration (coming soon)
# npm run migration:create -- AddUserTable

# Run migrations
# npm run migration:run

# Rollback migrations
# npm run migration:rollback
```

---

## Troubleshooting

### Docker Issues

**Problem:** Docker containers won't start
```bash
# Check Docker is running
docker info

# Stop all containers and restart
docker-compose down
docker-compose up -d

# View logs
docker-compose logs -f
```

**Problem:** Port already in use
```bash
# Find process using the port (e.g., 5432)
lsof -i :5432

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

**Problem:** Can't connect to PostgreSQL
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Connect directly to PostgreSQL
docker exec -it suberfood-postgres psql -U suberfood -d suberfood_dev
```

### Build Issues

**Problem:** TypeScript compilation errors
```bash
# Clean all build artifacts
npm run clean

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

**Problem:** Next.js cache issues
```bash
cd apps/landing-page
rm -rf .next
npm run dev
```

---

## Coding Standards

### TypeScript

- Use strict mode
- Define types for all function parameters and return values
- Avoid `any` type
- Use interfaces for object shapes

### React/Next.js

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for prop types
- Follow Next.js 14 App Router conventions

### Backend Services

- Follow Clean Architecture principles
- Write unit tests for business logic
- Use dependency injection
- Validate all inputs with Zod or similar

### Naming Conventions

- **Files:** kebab-case (e.g., `user-service.ts`)
- **Components:** PascalCase (e.g., `UserProfile.tsx`)
- **Functions:** camelCase (e.g., `getUserById`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)

---

## Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Integration Tests

```bash
# Coming soon
npm run test:integration
```

### E2E Tests

```bash
# Coming soon
npm run test:e2e
```

---

## Resources

### Documentation

- [Project Requirements](/docs/01-PROJECT-REQUIREMENTS-DOCUMENT.md)
- [Technical Architecture](/docs/02-TECHNICAL-ARCHITECTURE.md)
- [Database Schema](/docs/database/03-DATABASE-SCHEMA-DESIGN.md)
- [API Specification](/docs/api/04-API-SPECIFICATION.md)
- [Development Roadmap](/docs/roadmap/05-DEVELOPMENT-ROADMAP.md)

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

## Getting Help

- **Slack:** #suberfood-dev
- **Email:** dev@suberfood.com
- **Tech Lead:** [Name] - [email]
- **Documentation:** https://docs.suberfood.com

---

## Next Steps

1. ✅ Complete this getting started guide
2. ✅ Set up your development environment
3. ✅ Run the landing page locally
4. ✅ Explore the codebase
5. Read the [Project Requirements Document](/docs/01-PROJECT-REQUIREMENTS-DOCUMENT.md)
6. Join the team standup meetings
7. Pick your first task from the backlog
8. Start contributing!

---

**Welcome to the team! Happy coding! 🚀**
