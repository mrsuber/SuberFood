# SuberFood - Quick Start Guide

Get up and running with SuberFood in minutes!

## ⚡ Prerequisites
- Node.js 18+ and npm 9+
- Docker Desktop installed and running

## 🚀 Quick Setup (5 Minutes)

```bash
# 1. Clone and install
git clone https://github.com/suberfood/suberfood.git
cd suberfood
npm install

# 2. Set up environment
cp .env.example .env.local

# 3. Start Docker services
docker-compose up -d

# 4. Start development servers
npm run dev
```

## 🌐 Access Applications

- **Landing Page:** http://localhost:3000
- **pgAdmin (Database):** http://localhost:5050 (admin@suberfood.com / admin)
- **Mongo Express:** http://localhost:8081
- **MinIO Console:** http://localhost:9001 (suberfood / dev_password_change_in_prod)

## 📚 Next Steps

1. Read the [Getting Started Guide](docs/GETTING-STARTED.md) for detailed setup
2. Explore [Project Requirements](docs/01-PROJECT-REQUIREMENTS-DOCUMENT.md)
3. Review [Technical Architecture](docs/02-TECHNICAL-ARCHITECTURE.md)
4. Check the [Development Roadmap](docs/roadmap/05-DEVELOPMENT-ROADMAP.md)

## 🛠️ Common Commands

```bash
npm run dev          # Start all apps
npm run build        # Build all apps
npm run test         # Run tests
npm run lint         # Lint code
npm run format       # Format code
npm run clean        # Clean build artifacts
```

## 📂 Project Structure

```
SuberFood/
├── apps/                # Frontend applications (Next.js, React)
├── services/            # Backend microservices (Node.js/TypeScript)
├── shared/              # Shared libraries
├── infrastructure/      # Docker, Kubernetes, Terraform
└── docs/                # Complete documentation
```

## 📞 Need Help?

- **Documentation:** [Getting Started Guide](docs/GETTING-STARTED.md)
- **Slack:** #suberfood-dev
- **Email:** dev@suberfood.com

---

**Happy Coding! 🎉**
