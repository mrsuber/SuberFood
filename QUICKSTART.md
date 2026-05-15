# SuberFood - Quick Start Guide

Get up and running with SuberFood in minutes!

## ⚡ Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 14+ (server deployment)
- Nginx (for production)

## 🚀 Production Setup (Server Deployment)

**Server Details:**
- **IP:** 148.230.118.19
- **Domain:** suberfoods.com
- **Database:** PostgreSQL (shared with other applications)
- **Web Server:** Nginx with SSL

```bash
# 1. SSH into server
ssh user@148.230.118.19

# 2. Clone and install
cd ~/dev/personal
git clone <repository-url> SuberFood
cd SuberFood
npm install

# 3. Set up environment
cp .env.example .env.production
# Edit .env.production with production credentials

# 4. Build application
npm run build

# 5. Start production server
pm2 start ecosystem.config.js
```

## 🌐 Access Applications

- **Production Site:** https://suberfoods.com
- **SSL:** Configured with Let's Encrypt
- **Database:** PostgreSQL on same server

## 🐳 Local Development (Optional)

For local development with Docker:

```bash
# 1. Clone and install
npm install

# 2. Set up environment
cp .env.example .env.local

# 3. Start Docker services (optional)
docker-compose up -d

# 4. Start development servers
npm run dev
```

**Local URLs:**
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
