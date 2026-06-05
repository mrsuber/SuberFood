# Quick Start Guide - SuberFood Development

## For New Sessions - Start Here! 👋

### Step 1: Read the Documentation (5 minutes)

**Primary Document:** `IMPLEMENTATION_PLAN.md`
- This is the MASTER plan document
- Contains complete project overview, requirements, and progress tracker
- Check "Progress Tracker" section to see what's done
- Check "Notes & Decisions" for latest session notes

**Session Summary:** `SESSION_SUMMARY.md`
- Quick overview of last session
- Current blockers
- Immediate next steps

### Step 2: Check Current Status

```bash
# Check git status to see what changed
git status

# View schema changes (if any uncommitted)
git diff apps/landing-page/prisma/schema.prisma

# Check if migration is needed
ls -la apps/landing-page/prisma/migrations/
```

### Step 3: Resolve Current Blocker (Database Connection)

The database server is currently unreachable. Try:

**Option A: SSH into server and start PostgreSQL**
```bash
ssh root@148.230.118.19
sudo systemctl status postgresql
sudo systemctl start postgresql
```

**Option B: Use SSH tunnel**
```bash
ssh -L 5432:localhost:5432 root@148.230.118.19 -N
# Then in another terminal, run migration
```

**Option C: Check if server is running**
```bash
ping 148.230.118.19
telnet 148.230.118.19 5432
```

### Step 4: Run Pending Migration

Once database is accessible:

```bash
cd apps/landing-page

# Create and apply migration
npx prisma migrate dev --name add_multi_branch_support

# Generate Prisma Client
npx prisma generate

# Verify migration worked
npx prisma migrate status
```

### Step 5: Continue Phase 1 Development

Follow the checklist in `IMPLEMENTATION_PLAN.md` under "Progress Tracker > Phase 1".

Next tasks are:
1. Build staff management APIs
2. Build location APIs
3. Build staff management UI
4. Build location browser UI

---

## Project Structure Overview

```
SuberFood/
├── IMPLEMENTATION_PLAN.md   ← 📚 MASTER PLAN - Read this first!
├── SESSION_SUMMARY.md        ← 📋 Last session summary
├── QUICK_START.md            ← 🚀 This file
├── apps/
│   └── landing-page/         ← Main Next.js app
│       ├── prisma/
│       │   └── schema.prisma ← Database schema (MODIFIED - not migrated yet)
│       └── src/
│           ├── app/
│           │   ├── api/      ← API routes
│           │   ├── admin/    ← Admin dashboards
│           │   └── ...
│           └── components/   ← UI components
└── ...
```

---

## Current State Summary

### ✅ Completed
- Database schema extended with 8 new models
- All models documented
- Schema validated and formatted
- Plan document created

### ⚠️ Blocked
- Migration pending (database not accessible)

### 📋 Next Up (Phase 1)
- Staff management APIs
- Location APIs
- Staff UI
- Location browser UI

---

## Development Commands

```bash
# Format schema
npx prisma format

# Create migration (without applying)
npx prisma migrate dev --create-only --name migration_name

# Apply migration
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start dev server
npm run dev

# Build project
npm run build
```

---

## Key Design Decisions

1. **Multi-Branch Architecture:** Restaurants can have parent-child relationships via `parentRestaurantId`
2. **Location-Specific Inventory:** Each restaurant location has its own inventory
3. **Staff-User Link:** One staff member = one user account (one-to-one via userId)
4. **Kitchen Workflow:** OrderPreparation tracks chef assignment and progress photos
5. **Delivery Tracking:** Real-time GPS tracking via DeliveryLocationHistory
6. **Equipment Tracking:** Maintenance logs and usage tracking for cost analysis

---

## Important Files to Review

### Database
- `apps/landing-page/prisma/schema.prisma` - Database schema

### Existing Code (to understand)
- `apps/landing-page/src/lib/auth.ts` - Authentication logic
- `apps/landing-page/src/app/api/orders/route.ts` - Order creation API
- `apps/landing-page/src/lib/inventory.ts` - Inventory helpers

### To Be Created (Phase 1)
- `apps/landing-page/src/app/api/admin/staff/route.ts`
- `apps/landing-page/src/app/api/locations/route.ts`
- `apps/landing-page/src/app/locations/page.tsx`
- `apps/landing-page/src/app/admin/staff/page.tsx`

---

## Need Help?

1. Check `IMPLEMENTATION_PLAN.md` for detailed specs
2. Look at existing API routes for patterns
3. Review git history: `git log --oneline`
4. Check recent commits: `git log -5 --stat`

---

**Remember:** Always update `IMPLEMENTATION_PLAN.md` > "Notes & Decisions" section with important decisions made during development!
