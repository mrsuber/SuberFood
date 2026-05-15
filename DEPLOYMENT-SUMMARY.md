# SuberFood - Deployment Summary

## Server Information
- **IP Address:** 148.230.118.19
- **Domain:** suberfoods.com (www.suberfoods.com)
- **SSL Certificate:** Let's Encrypt (Auto-renews)
- **Certificate Expiry:** 2026-08-13

## Deployment Details

### Application
- **Location:** `/root/suberfood`
- **Process Manager:** PM2
- **Process Name:** `suberfood-landing`
- **Port:** 3030 (internal)
- **Build:** Next.js 14.2.35 (Production)
- **Status:** ✅ Online

### Database
- **Type:** PostgreSQL
- **Database Name:** `suberfood_db`
- **Username:** `suberfood_user`
- **Host:** localhost:5432
- **Status:** ✅ Connected

### Web Server
- **Type:** Nginx 1.24.0
- **Config:** `/etc/nginx/sites-available/suberfoods.com`
- **Features:**
  - HTTP to HTTPS redirect
  - Security headers enabled
  - Proxy to Next.js on port 3030
  - 100MB client upload limit

### Access URLs
- **Production:** https://suberfoods.com
- **With WWW:** https://www.suberfoods.com

## Deployment Commands

### Update Application
```bash
# SSH into server
ssh root@148.230.118.19

# Navigate to project
cd /root/suberfood

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Build the landing page
cd apps/landing-page
npm run build
cd ../..

# Restart the application
pm2 restart suberfood-landing

# Check logs
pm2 logs suberfood-landing
```

### PM2 Management
```bash
# View all processes
pm2 list

# View logs
pm2 logs suberfood-landing

# Restart application
pm2 restart suberfood-landing

# Stop application
pm2 stop suberfood-landing

# View process details
pm2 show suberfood-landing
```

### Nginx Management
```bash
# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# View error logs
tail -f /var/log/nginx/suberfoods.com.error.log

# View access logs
tail -f /var/log/nginx/suberfoods.com.access.log
```

### Database Management
```bash
# Connect to database
sudo -u postgres psql suberfood_db

# Backup database
sudo -u postgres pg_dump suberfood_db > backup_$(date +%Y%m%d).sql

# Restore database
sudo -u postgres psql suberfood_db < backup_file.sql
```

## SSL Certificate
- **Auto-renewal:** Certbot handles renewal automatically
- **Manual renewal test:**
  ```bash
  certbot renew --dry-run
  ```

## Monitoring

### Check Application Status
```bash
# Check if Next.js is running
curl -I http://localhost:3030

# Check through Nginx
curl -I https://suberfoods.com

# PM2 status
pm2 status
```

### View Logs
```bash
# Application logs
pm2 logs suberfood-landing --lines 50

# Nginx error logs
tail -f /var/log/nginx/suberfoods.com.error.log

# System logs
journalctl -u nginx -f
```

## Environment Configuration
- **File:** `/root/suberfood/.env.production`
- **Important Variables:**
  - `DATABASE_URL` - PostgreSQL connection
  - `NODE_ENV=production`
  - `PORT=3030`
  - `NEXT_PUBLIC_APP_URL=https://suberfoods.com`

## Security
- ✅ SSL/TLS enabled with Let's Encrypt
- ✅ HTTP to HTTPS redirect
- ✅ Security headers configured
- ✅ Database credentials secured
- ✅ Firewall configured (assumed)

## Next Steps for Development
1. Set up CI/CD pipeline (GitHub Actions)
2. Configure monitoring (Prometheus/Grafana)
3. Set up automated backups for database
4. Add more microservices as needed
5. Configure Redis for caching
6. Set up staging environment
7. Implement logging aggregation (ELK Stack)

## Troubleshooting

### Application not loading
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs suberfood-landing

# Restart application
pm2 restart suberfood-landing
```

### SSL Issues
```bash
# Test Nginx configuration
nginx -t

# Check SSL certificate
certbot certificates

# Renew certificate manually
certbot renew --force-renewal
```

### Database Connection Issues
```bash
# Check PostgreSQL status
systemctl status postgresql

# Test database connection
sudo -u postgres psql -c "SELECT 1;"

# Check database exists
sudo -u postgres psql -c "\l"
```

## Contacts
- **Technical Issues:** dev@suberfoods.com
- **Server Access:** SSH key required

---

**Deployment Date:** May 15, 2026
**Deployed By:** Claude Code
**Status:** ✅ Production Ready
